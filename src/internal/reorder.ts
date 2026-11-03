import {EASE_OUT, prefersReducedMotion} from './animate';
import type {FormControlController} from './form';
import type {ReactiveController, ReactiveControllerHost} from 'lit';

/** A component whose keyed items can be dragged, or moved by keyboard, into a new order. */
export interface ReorderHost extends ReactiveControllerHost, HTMLElement {
  /** The item keys in their current order. */
  reorderKeys: () => string[];

  /** Shows the items in a new order. */
  applyReorder: (keys: string[]) => void;

  /** The row drawn for an item, measured to slide it from its old position. */
  reorderRow: (key: string) => HTMLElement | null;

  /** Every element that slides with an item, when more than its row does (a table column's cells). */
  reorderSlides?: (key: string) => HTMLElement[];

  /** Whether an item is pinned where it is; nothing can move past it either. */
  reorderLocked?: (key: string) => boolean;

  /** Where the pointer must be for a drag to land; letting go outside it cancels. Defaults to the rows' parent. */
  reorderArea?: () => HTMLElement | null;

  /** The element that follows the pointer while dragging. Defaults to a copy of the item's row. */
  reorderGhost?: (key: string) => HTMLElement;

  /** Submits the form after each reorder when set: to this URL, or the form's own action when empty. */
  formAction?: string;

  disabled?: boolean;
}

export interface ReorderOptions {
  /** Submits through the host's form, which announces the form so a host page can intercept the submit. */
  formControl?: FormControlController;

  /** Fields for a temporary form when the host has a `formaction` but no form of its own. */
  fallbackFields?: () => [string, string][];

  /** Keys that move the focused item. With `alt`, plain arrows are left to navigate between items. */
  modifier?: 'none' | 'alt';

  /** Focuses an item after it moves by keyboard. */
  focus?: (key: string) => void;

  /** Which way the items run: arrow keys, the drag midpoint and the slide follow it. */
  axis?: 'vertical' | 'horizontal';

  /**
   * Leaves the items in place while dragging and tracks `dropIndex` for the host to draw a drop line, moving the item
   * only on drop. Suits items of very different sizes, which would jump under the pointer when moved live.
   */
  indicator?: boolean;
}

type ReorderEvent = 'zn-change' | 'zn-reorder';

interface Point {
  x: number;
  y: number;
}

// How far a mouse or pen moves before a press becomes a drag, so a click still clicks
const DRAG_THRESHOLD = 4;
// How long a touch holds still before it drags; moving sooner scrolls instead
const TOUCH_HOLD = 300;
// The band at a scroller's edge that scrolls it while dragging
const SCROLL_EDGE = 40;
const SCROLL_SPEED = 12;

/**
 * Pointer and keyboard reordering for a keyed list, with the change announced through `zn-change` and `zn-reorder`
 * and, when the host has a `formaction`, submitted with its form.
 *
 * Dragging runs on pointer events rather than native drag and drop, which hands the cursor to the browser for the
 * whole drag.
 */
export class ReorderController implements ReactiveController {
  /** The item being dragged, styled as its placeholder. */
  draggedKey: string | null = null;

  /** Whether a drag is under way, for transitions while items shift. */
  isDragging = false;

  /** With `indicator`, the boundary the dragged item would drop at: before the item at this index, or after the last. */
  dropIndex: number | null = null;

  private readonly host: ReorderHost;
  private readonly options: ReorderOptions;
  private dragKey: string | null = null;
  private startOrder: string[] = [];
  private sliding = 0;
  private listOverflow = '';
  private press: {key: string; pointerId: number; touch: boolean; origin: Point; hold?: number} | null = null;
  private point: Point = {x: 0, y: 0};
  private ghost: HTMLElement | null = null;
  private ghostOffset: Point = {x: 0, y: 0};
  private shield: HTMLElement | null = null;
  private scroller: Element | null = null;
  private scrollFrame = 0;

  constructor(host: ReorderHost, options: ReorderOptions = {}) {
    this.host = host;
    this.options = options;
    host.addController(this);
  }

  hostConnected() {
    // Nothing to set up; the host wires pointerdown to its own rows.
  }

  hostDisconnected() {
    if (this.isDragging) this.endDrag(true);
    this.release();
  }

  private get horizontal() {
    return this.options.axis === 'horizontal';
  }

  /** The leading edge of a row along the axis. */
  private start(row: HTMLElement | null) {
    const rect = row?.getBoundingClientRect();
    return this.horizontal ? rect?.left : rect?.top;
  }

  private keys() {
    return this.host.reorderKeys();
  }

  isLocked(key: string) {
    return this.host.reorderLocked?.(key) ?? false;
  }

  /** A move is allowed when neither the moved item nor any item it would shift past is locked. */
  canMove(fromIndex: number, toIndex: number) {
    const keys = this.keys();
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= keys.length || toIndex >= keys.length) return false;
    if (this.isLocked(keys[fromIndex])) return false;
    const [low, high] = fromIndex < toIndex ? [fromIndex + 1, toIndex] : [toIndex, fromIndex - 1];
    for (let i = low; i <= high; i++) {
      if (this.isLocked(keys[i])) return false;
    }
    return true;
  }

  canStep(key: string, step: number) {
    const index = this.keys().indexOf(key);
    return index !== -1 && this.canMove(index, index + step);
  }

  /** Moves an item and announces the new order. */
  move(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex || !this.canMove(fromIndex, toIndex)) return false;
    this.reorder(moved(this.keys(), fromIndex, toIndex));
    this.commit();
    return true;
  }

  step(key: string, step: number) {
    const index = this.keys().indexOf(key);
    return this.move(index, index + step);
  }

  /** Arrow keys move the item one place and Home/End to either end. Returns whether the key was handled. */
  handleKeyDown(event: KeyboardEvent, key: string) {
    if (this.host.disabled) return false;
    if ((this.options.modifier ?? 'none') === 'alt' && !event.altKey) return false;

    const keys = this.keys();
    const index = keys.indexOf(key);
    if (index === -1) return false;

    const [back, forward] = this.horizontal ? ['ArrowLeft', 'ArrowRight'] : ['ArrowUp', 'ArrowDown'];
    const target = {
      [back]: index - 1,
      [forward]: index + 1,
      Home: 0,
      End: keys.length - 1,
    }[event.key];
    if (target === undefined || target === index || target < 0 || target >= keys.length) return false;

    event.preventDefault();
    if (this.move(index, target)) {
      void this.host.updateComplete.then(() => this.options.focus?.(key));
    }
    return true;
  }

  /** Starts tracking a press on an item; it becomes a drag once the pointer moves, or a touch holds still. */
  handlePointerDown(event: PointerEvent, key: string) {
    if (event.button !== 0 || this.press || this.isDragging) return;
    if (this.host.disabled || this.isLocked(key) || !this.host.reorderRow(key)) return;
    if (event.composedPath().some(el => el instanceof HTMLElement && el.matches('input, textarea, select, [contenteditable]'))) return;

    const touch = event.pointerType === 'touch';
    this.point = {x: event.clientX, y: event.clientY};
    this.press = {key, pointerId: event.pointerId, touch, origin: this.point};
    if (touch) this.press.hold = window.setTimeout(() => this.beginDrag(), TOUCH_HOLD);

    window.addEventListener('pointermove', this.onPointerMove, true);
    window.addEventListener('pointerup', this.onPointerUp, true);
    window.addEventListener('pointercancel', this.onPointerCancel, true);
    window.addEventListener('touchmove', this.onTouchMove, {capture: true, passive: false});
    // A link or image in the row would otherwise start a native drag and take the pointer
    window.addEventListener('dragstart', this.onNativeDragStart, true);
  }

  private onPointerMove = (event: PointerEvent) => {
    if (event.pointerId !== this.press?.pointerId) return;
    this.point = {x: event.clientX, y: event.clientY};

    if (!this.isDragging) {
      const {origin, touch} = this.press;
      if (Math.hypot(this.point.x - origin.x, this.point.y - origin.y) < DRAG_THRESHOLD) return;
      // A touch that moves before the hold is a scroll
      if (touch) this.release();
      else this.beginDrag();
      return;
    }

    this.placeGhost();
    this.dragOver();
  };

  private onPointerUp = (event: PointerEvent) => {
    if (event.pointerId !== this.press?.pointerId) return;
    this.point = {x: event.clientX, y: event.clientY};
    if (this.isDragging) {
      this.endDrag(!this.inArea());
      // The release still clicks, which would sort a column or select an item
      window.addEventListener('click', swallow, {capture: true, once: true});
      setTimeout(() => window.removeEventListener('click', swallow, true));
    }
    this.release();
  };

  private onPointerCancel = (event: PointerEvent) => {
    if (event.pointerId !== this.press?.pointerId) return;
    if (this.isDragging) this.endDrag(true);
    this.release();
  };

  private onTouchMove = (event: TouchEvent) => {
    if (this.isDragging) event.preventDefault();
  };

  private onNativeDragStart = (event: DragEvent) => {
    event.preventDefault();
  };

  private onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    this.endDrag(true);
    this.release();
  };

  private beginDrag() {
    const key = this.press?.key;
    const row = key ? this.host.reorderRow(key) : null;
    if (!key || !row) {
      this.release();
      return;
    }
    window.clearTimeout(this.press!.hold);

    const rect = row.getBoundingClientRect();
    const custom = this.host.reorderGhost?.(key);
    const ghost = custom ?? snapshot(row);
    this.ghostOffset = custom ? {x: 12, y: 16} : {x: this.point.x - rect.left, y: this.point.y - rect.top};
    Object.assign(ghost.style, {
      position: 'fixed',
      left: '0',
      top: '0',
      margin: '0',
      zIndex: '2147483647',
      pointerEvents: 'none',
    });
    if (!custom) {
      Object.assign(ghost.style, {
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        boxSizing: 'border-box',
        background: 'rgb(var(--zn-panel, 255, 255, 255))',
        boxShadow: 'var(--zn-shadow-large, 0 8px 24px rgba(13, 23, 56, 0.16))',
        borderRadius: getComputedStyle(row).borderRadius,
        opacity: '0.95',
      });
    }
    ghost.inert = true;

    // Covers the page while dragging, so the cursor stays a closed hand over everything and nothing else reacts
    const shield = document.createElement('div');
    Object.assign(shield.style, {position: 'fixed', inset: '0', zIndex: '2147483646', cursor: 'grabbing', touchAction: 'none'});

    // Inside the row's own tree so its styles reach the copy, and a modal dialog around it doesn't make it inert
    const root = row.getRootNode();
    const container = root instanceof ShadowRoot ? root : document.body;
    container.append(shield, ghost);
    this.ghost = ghost;
    this.shield = shield;
    this.placeGhost();

    getSelection()?.removeAllRanges();
    this.dragKey = key;
    this.draggedKey = key;
    this.startOrder = this.keys();
    this.isDragging = true;
    this.scroller = scrollerOf(this.area(), this.horizontal);
    this.scrollFrame = requestAnimationFrame(this.autoScroll);
    window.addEventListener('keydown', this.onKeyDown, true);
    this.host.requestUpdate();
  }

  private placeGhost() {
    if (!this.ghost) return;
    this.ghost.style.transform = `translate(${this.point.x - this.ghostOffset.x}px, ${this.point.y - this.ghostOffset.y}px)`;
  }

  private area() {
    return this.host.reorderArea?.() ?? this.host.reorderRow(this.keys()[0])?.parentElement ?? null;
  }

  private inArea() {
    const rect = this.area()?.getBoundingClientRect();
    return !!rect && this.point.x >= rect.left && this.point.x <= rect.right && this.point.y >= rect.top && this.point.y <= rect.bottom;
  }

  // The item whose span along the axis holds the pointer; none in a gap between items or outside the list
  private hoveredKey() {
    if (!this.inArea()) return null;
    const at = this.horizontal ? this.point.x : this.point.y;
    return this.keys().find(key => {
      const rect = this.host.reorderRow(key)?.getBoundingClientRect();
      if (!rect) return false;
      return this.horizontal ? at >= rect.left && at < rect.right : at >= rect.top && at < rect.bottom;
    }) ?? null;
  }

  /**
   * Moves the dragged item to the hovered one's place, once the pointer crosses that item's midpoint. In a gap
   * between items nothing moves, and letting go there keeps the order so far.
   */
  private dragOver() {
    const key = this.hoveredKey();
    if (this.options.indicator) {
      this.trackDropIndex(key);
      return;
    }
    if (!key || !this.dragKey || this.dragKey === key) return;

    const keys = this.keys();
    const fromIndex = keys.indexOf(this.dragKey);
    const toIndex = keys.indexOf(key);
    if (fromIndex === -1 || toIndex === -1) return;

    // Rows of different sizes would otherwise flip back and forth
    if (fromIndex < toIndex !== this.pastMidpoint(key)) return;
    if (!this.canMove(fromIndex, toIndex)) return;

    this.reorder(moved(keys, fromIndex, toIndex));
  }

  private pastMidpoint(key: string) {
    const rect = this.host.reorderRow(key)!.getBoundingClientRect();
    return this.horizontal
      ? this.point.x > rect.left + rect.width / 2
      : this.point.y > rect.top + rect.height / 2;
  }

  // The nearest boundary of the hovered item; a gap between items keeps the last one, and leaving the list clears it
  private trackDropIndex(key: string | null) {
    if (!this.dragKey) return;
    if (!key) {
      if (this.inArea()) return;
      this.setDropIndex(null);
      return;
    }

    const keys = this.keys();
    const fromIndex = keys.indexOf(this.dragKey);
    const index = keys.indexOf(key);
    if (fromIndex === -1 || index === -1) return;

    const boundary = index + (this.pastMidpoint(key) ? 1 : 0);
    const toIndex = this.dropTarget(fromIndex, boundary);
    this.setDropIndex(toIndex !== fromIndex && this.canMove(fromIndex, toIndex) ? boundary : null);
  }

  private setDropIndex(dropIndex: number | null) {
    if (dropIndex === this.dropIndex) return;
    this.dropIndex = dropIndex;
    this.host.requestUpdate();
  }

  // The index the item moves to once taken out from before the boundary
  private dropTarget(fromIndex: number, boundary: number) {
    return boundary > fromIndex ? boundary - 1 : boundary;
  }

  // Scrolls the list's scroller while the pointer sits in the band at either end of it
  private autoScroll = () => {
    if (!this.isDragging) return;
    this.scrollFrame = requestAnimationFrame(this.autoScroll);

    const scroller = this.scroller;
    if (!scroller) return;
    const page = scroller === document.scrollingElement;
    const rect = page
      ? {left: 0, top: 0, right: innerWidth, bottom: innerHeight}
      : scroller.getBoundingClientRect();
    const [at, start, end] = this.horizontal
      ? [this.point.x, rect.left, rect.right]
      : [this.point.y, rect.top, rect.bottom];

    const into = at < start + SCROLL_EDGE ? at - (start + SCROLL_EDGE) : at > end - SCROLL_EDGE ? at - (end - SCROLL_EDGE) : 0;
    if (!into) return;
    const by = Math.max(-1, Math.min(1, into / SCROLL_EDGE)) * SCROLL_SPEED;
    const before = this.horizontal ? scroller.scrollLeft : scroller.scrollTop;
    scroller.scrollBy(this.horizontal ? {left: by} : {top: by});
    if ((this.horizontal ? scroller.scrollLeft : scroller.scrollTop) !== before) this.dragOver();
  };

  private endDrag(cancel: boolean) {
    if (!this.isDragging) return;

    if (!cancel && this.options.indicator && this.dropIndex !== null && this.dragKey) {
      const fromIndex = this.keys().indexOf(this.dragKey);
      this.reorder(moved(this.keys(), fromIndex, this.dropTarget(fromIndex, this.dropIndex)));
    }

    const startOrder = this.startOrder;
    this.dragKey = null;
    this.draggedKey = null;
    this.dropIndex = null;
    this.isDragging = false;
    cancelAnimationFrame(this.scrollFrame);
    window.removeEventListener('keydown', this.onKeyDown, true);
    this.ghost?.remove();
    this.shield?.remove();
    this.ghost = null;
    this.shield = null;
    this.scroller = null;
    this.host.requestUpdate();

    const changed = startOrder.join('\n') !== this.keys().join('\n');
    if (!changed) return;
    if (cancel) {
      this.reorder(startOrder);
      return;
    }
    this.commit();
  }

  // Stops tracking the press, whether or not it became a drag
  private release() {
    if (this.press) window.clearTimeout(this.press.hold);
    this.press = null;
    window.removeEventListener('pointermove', this.onPointerMove, true);
    window.removeEventListener('pointerup', this.onPointerUp, true);
    window.removeEventListener('pointercancel', this.onPointerCancel, true);
    window.removeEventListener('touchmove', this.onTouchMove, true);
    window.removeEventListener('dragstart', this.onNativeDragStart, true);
  }

  /** Shows the new order, sliding each row from its old position. */
  reorder(keys: string[]) {
    const before = new Map(this.keys().map(key => [key, this.start(this.host.reorderRow(key))]));
    this.host.applyReorder(keys);

    if (prefersReducedMotion()) return;
    void this.host.updateComplete.then(() => {
      const slides: Animation[] = [];
      for (const key of keys) {
        const row = this.host.reorderRow(key);
        const start = before.get(key);
        if (!row || start === undefined) continue;
        const delta = start - this.start(row)!;
        if (!delta) continue;
        const from = this.horizontal ? `translateX(${delta}px)` : `translateY(${delta}px)`;
        for (const el of this.host.reorderSlides?.(key) ?? [row]) {
          slides.push(el.animate([{transform: from}, {transform: 'none'}], {duration: 150, easing: EASE_OUT}));
        }
      }
      this.clipWhileSliding(this.host.reorderRow(keys[0])?.parentElement, slides);
    });
  }

  // A row can change size with its place (a flush list's last row has no border), so it pokes out of the list
  // mid-slide and flashes a scrollbar on the scroller around it
  private clipWhileSliding(list: HTMLElement | null | undefined, slides: Animation[]) {
    if (!list || !slides.length) return;
    if (this.sliding++ === 0) {
      this.listOverflow = list.style.overflow;
      list.style.overflow = 'clip';
    }
    void Promise.allSettled(slides.map(slide => slide.finished)).then(() => {
      if (--this.sliding === 0) list.style.overflow = this.listOverflow;
    });
  }

  private commit() {
    this.emit('zn-change');
    this.emit('zn-reorder');
    this.submit();
  }

  private emit(name: ReorderEvent) {
    this.host.dispatchEvent(new CustomEvent(name, {bubbles: true, composed: true}));
  }

  /** Submits the host's form when it has a `formaction`. */
  private submit() {
    const formAction = this.host.formAction;
    if (formAction === undefined || formAction === null) return;

    const formControl = this.options.formControl;
    if (formControl?.getForm()) {
      // Submitting through the controller announces the form before it is submitted, which is what lets a host
      // page intercept the submit: a submit event raised on a form inside a shadow root never reaches the document.
      const submitter = document.createElement('input');
      submitter.type = 'submit';
      if (formAction) {
        submitter.setAttribute('formaction', formAction);
      }
      formControl.submit(submitter);
      return;
    }

    if (!formAction) return;
    const form = document.createElement('form');
    form.method = 'post';
    form.action = formAction;
    form.hidden = true;
    for (const [name, value] of this.options.fallbackFields?.() ?? []) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.append(input);
    }
    document.body.append(form);
    // requestSubmit raises a cancellable submit event, so a host page can handle it rather than navigating
    form.requestSubmit();
    form.remove();
  }
}

function swallow(event: Event) {
  event.preventDefault();
  event.stopPropagation();
}

/** A copy of a row to drag, with each slot replaced by what it shows, as a copy outside the slot's host shows nothing. */
function snapshot(row: HTMLElement) {
  const copy = row.cloneNode(true) as HTMLElement;
  const slots = row.querySelectorAll('slot');
  const copies = copy.querySelectorAll('slot');
  slots.forEach((slot, i) => copies[i].replaceWith(...slot.assignedNodes({flatten: true}).map(node => node.cloneNode(true))));
  copy.removeAttribute('id');
  return copy;
}

/** The nearest element that scrolls along the axis, crossing shadow boundaries, or the page. */
function scrollerOf(from: Element | null, horizontal: boolean): Element | null {
  for (let el: Element | null = from; el; el = el.parentElement ?? ((el.getRootNode() as ShadowRoot).host ?? null)) {
    const style = getComputedStyle(el);
    const overflow = horizontal ? style.overflowX : style.overflowY;
    const scrolls = horizontal ? el.scrollWidth > el.clientWidth : el.scrollHeight > el.clientHeight;
    if (scrolls && (overflow === 'auto' || overflow === 'scroll')) return el;
  }
  return document.scrollingElement;
}

function moved(keys: string[], fromIndex: number, toIndex: number) {
  const order = [...keys];
  const [item] = order.splice(fromIndex, 1);
  order.splice(toIndex, 0, item);
  return order;
}

/**
 * The border radius that rounds a row's corners where it meets the corners of the nearest rounded ancestor of `host`
 * that clips it (a flush list in a panel), so a drag placeholder's dashed outline follows the clip there instead of
 * being cut off. Null when nothing rounded clips the row.
 */
export function clipCornerRadius(host: Element, row: HTMLElement): string | null {
  const parent = (el: Element): Element | null =>
    el.assignedSlot ?? el.parentElement ?? (el.getRootNode() as ShadowRoot).host ?? null;

  let clip: Element | null = null;
  for (let el = parent(host); el; el = parent(el)) {
    const style = getComputedStyle(el);
    if (style.overflow !== 'visible' && style.borderRadius !== '0px') {
      clip = el;
      break;
    }
  }
  if (!clip) return null;

  const style = getComputedStyle(clip);
  const outer = clip.getBoundingClientRect();
  const bl = parseFloat(style.borderLeftWidth);
  const br = parseFloat(style.borderRightWidth);
  const bt = parseFloat(style.borderTopWidth);
  const bb = parseFloat(style.borderBottomWidth);
  const r = row.getBoundingClientRect();
  const top = Math.abs(r.top - (outer.top + bt)) < 1;
  const bottom = Math.abs(r.bottom - (outer.bottom - bb)) < 1;
  const left = Math.abs(r.left - (outer.left + bl)) < 1;
  const right = Math.abs(r.right - (outer.right - br)) < 1;
  // The clip follows the padding edge, whose radius is the border radius less the border width
  const corner = (touches: boolean, radius: string, border: number) =>
    touches ? `${Math.max(0, parseFloat(radius) - border)}px` : '0px';

  return [
    corner(top && left, style.borderTopLeftRadius, Math.max(bt, bl)),
    corner(top && right, style.borderTopRightRadius, Math.max(bt, br)),
    corner(bottom && right, style.borderBottomRightRadius, Math.max(bb, br)),
    corner(bottom && left, style.borderBottomLeftRadius, Math.max(bb, bl)),
  ].join(' ');
}
