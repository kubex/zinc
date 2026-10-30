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

/**
 * Drag-and-drop and keyboard reordering for a keyed list, with the change announced through `zn-change` and
 * `zn-reorder` and, when the host has a `formaction`, submitted with its form.
 */
export class ReorderController implements ReactiveController {
  /** The item being dragged, styled as its placeholder. Set a frame after the drag starts. */
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

  constructor(host: ReorderHost, options: ReorderOptions = {}) {
    this.host = host;
    this.options = options;
    host.addController(this);
  }

  hostConnected() {
    // Nothing to set up; the host wires the event handlers to its own rows.
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

  handleDragStart(event: DragEvent, key: string) {
    if (this.host.disabled || this.isLocked(key)) {
      event.preventDefault();
      return;
    }

    this.dragKey = key;
    this.startOrder = this.keys();
    this.isDragging = true;
    this.host.requestUpdate();
    // Styling the row as a placeholder before the browser snapshots it would fade the drag image too
    requestAnimationFrame(() => {
      if (this.isDragging) {
        this.draggedKey = key;
        this.host.requestUpdate();
      }
    });

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', key);
    }
  }

  /**
   * Moves the dragged item to the hovered one's place, once the pointer crosses that item's midpoint. Pass no key
   * for the space between items: the drop is still accepted there, so letting go in a gap keeps the new order.
   */
  handleDragOver(event: DragEvent, key?: string | null) {
    if (!this.isDragging) return;
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    if (this.options.indicator) {
      this.trackDropIndex(event, key);
      return;
    }
    if (!key || !this.dragKey || this.dragKey === key) return;

    const keys = this.keys();
    const fromIndex = keys.indexOf(this.dragKey);
    const toIndex = keys.indexOf(key);
    const row = this.host.reorderRow(key);
    if (fromIndex === -1 || toIndex === -1 || !row) return;

    // Rows of different sizes would otherwise flip back and forth
    const rect = row.getBoundingClientRect();
    const pastMidpoint = this.horizontal
      ? event.clientX > rect.left + rect.width / 2
      : event.clientY > rect.top + rect.height / 2;
    if (fromIndex < toIndex !== pastMidpoint) return;
    if (!this.canMove(fromIndex, toIndex)) return;

    this.reorder(moved(keys, fromIndex, toIndex));
  }

  handleDrop(event: DragEvent) {
    // Dragover has already moved the item into place, or with `indicator` it moves now; dragend announces the change
    event.preventDefault();
    if (this.dropIndex === null || !this.dragKey) return;

    const fromIndex = this.keys().indexOf(this.dragKey);
    this.reorder(moved(this.keys(), fromIndex, this.dropTarget(fromIndex, this.dropIndex)));
  }

  // The nearest boundary of the hovered item; a gap between items keeps the last one
  private trackDropIndex(event: DragEvent, key?: string | null) {
    if (!key || !this.dragKey) return;

    const keys = this.keys();
    const fromIndex = keys.indexOf(this.dragKey);
    const index = keys.indexOf(key);
    const row = this.host.reorderRow(key);
    if (fromIndex === -1 || index === -1 || !row) return;

    const rect = row.getBoundingClientRect();
    const pastMidpoint = this.horizontal
      ? event.clientX > rect.left + rect.width / 2
      : event.clientY > rect.top + rect.height / 2;
    const boundary = index + (pastMidpoint ? 1 : 0);
    const toIndex = this.dropTarget(fromIndex, boundary);
    const dropIndex = toIndex !== fromIndex && this.canMove(fromIndex, toIndex) ? boundary : null;

    if (dropIndex !== this.dropIndex) {
      this.dropIndex = dropIndex;
      this.host.requestUpdate();
    }
  }

  // The index the item moves to once taken out from before the boundary
  private dropTarget(fromIndex: number, boundary: number) {
    return boundary > fromIndex ? boundary - 1 : boundary;
  }

  handleDragEnd(event: DragEvent) {
    if (!this.isDragging) return;

    const startOrder = this.startOrder;
    this.dragKey = null;
    this.draggedKey = null;
    this.dropIndex = null;
    this.isDragging = false;
    this.host.requestUpdate();

    // Escape, or a drop outside the list, cancels the drag
    if (event.dataTransfer?.dropEffect === 'none') {
      this.reorder(startOrder);
      return;
    }
    if (startOrder.join('\n') === this.keys().join('\n')) return;

    this.commit();
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
