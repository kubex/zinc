export interface Point {
  x: number;
  y: number;
}

export interface PointerDragHandlers<T> {
  /** The element pressed on, copied to follow the pointer. Null declines the drag. */
  row: (source: T) => HTMLElement | null;

  /** The element that follows the pointer instead of a copy of the row. */
  ghost?: (source: T) => HTMLElement | undefined;

  /** The element whose nearest scroller scrolls while the pointer sits near its edge. */
  scrollArea?: () => Element | null;

  start?: (source: T) => void;

  move: (point: Point) => void;

  /** `cancel` is set when Escape is pressed or the pointer is lost. */
  end: (point: Point, cancel: boolean) => void;
}

// How far a mouse or pen moves before a press becomes a drag, so a click still clicks
const DRAG_THRESHOLD = 4;
// How long a touch holds still before it drags; moving sooner scrolls instead
const TOUCH_HOLD = 300;
// The band at a scroller's edge that scrolls it while dragging
const SCROLL_EDGE = 40;
const SCROLL_SPEED = 12;

/**
 * Drags with pointer events and a copy of the row following the pointer, rather than native drag and drop, which hands
 * the cursor to the browser for the whole drag.
 */
export class PointerDrag<T> {
  isDragging = false;
  point: Point = {x: 0, y: 0};

  private press: {source: T; pointerId: number; touch: boolean; origin: Point; hold?: number} | null = null;
  private ghost: HTMLElement | null = null;
  private ghostOffset: Point = {x: 0, y: 0};
  private shield: HTMLElement | null = null;
  private scroller: Element | null = null;
  private scrollFrame = 0;
  private pressRoot: Node | null = null;
  private userSelect: string | null = null;
  private readonly handlers: PointerDragHandlers<T>;
  private readonly axis: 'vertical' | 'horizontal';

  constructor(handlers: PointerDragHandlers<T>, axis: 'vertical' | 'horizontal' = 'vertical') {
    this.handlers = handlers;
    this.axis = axis;
  }

  /** Starts tracking a press; it becomes a drag once the pointer moves, or a touch holds still. */
  handlePointerDown(event: PointerEvent, source: T) {
    if (event.button !== 0 || this.press || this.isDragging) return;
    const row = this.handlers.row(source);
    if (!row) return;
    if (event.composedPath().some(el => el instanceof HTMLElement && el.matches('input, textarea, select, [contenteditable]'))) return;

    const touch = event.pointerType === 'touch';
    this.point = {x: event.clientX, y: event.clientY};
    this.press = {source, pointerId: event.pointerId, touch, origin: this.point};
    if (touch) this.press.hold = window.setTimeout(() => this.begin(), TOUCH_HOLD);

    window.addEventListener('pointermove', this.onPointerMove, true);
    window.addEventListener('pointerup', this.onPointerUp, true);
    window.addEventListener('pointercancel', this.onPointerCancel, true);
    window.addEventListener('touchmove', this.onTouchMove, {capture: true, passive: false});
    // A link or image in the row would otherwise start a native drag and take the pointer
    window.addEventListener('dragstart', this.cancel, true);
    // The press would otherwise also start a text selection that sweeps the page as it drags; selectstart isn't
    // composed, so it's caught in the row's own tree
    this.pressRoot = row.getRootNode();
    this.pressRoot.addEventListener('selectstart', this.cancel, true);
    // Safari still sweeps a selection across the page as the pointer moves, whatever selectstart says
    const style = document.documentElement.style;
    this.userSelect = style.getPropertyValue('-webkit-user-select');
    style.setProperty('-webkit-user-select', 'none');
  }

  /** Cancels any drag and stops tracking the press. */
  stop() {
    this.finish(true);
    this.release();
  }

  private onPointerMove = (event: PointerEvent) => {
    if (event.pointerId !== this.press?.pointerId) return;
    this.point = {x: event.clientX, y: event.clientY};

    if (!this.isDragging) {
      const {origin, touch} = this.press;
      if (Math.hypot(this.point.x - origin.x, this.point.y - origin.y) < DRAG_THRESHOLD) return;
      // A touch that moves before the hold is a scroll
      if (touch) this.release();
      else this.begin();
      return;
    }

    this.placeGhost();
    this.handlers.move(this.point);
  };

  private onPointerUp = (event: PointerEvent) => {
    if (event.pointerId !== this.press?.pointerId) return;
    this.point = {x: event.clientX, y: event.clientY};
    if (this.isDragging) {
      this.finish(false);
      // The release still clicks, which would sort a column or select an item
      window.addEventListener('click', swallow, {capture: true, once: true});
      setTimeout(() => window.removeEventListener('click', swallow, true));
    }
    this.release();
  };

  private onPointerCancel = (event: PointerEvent) => {
    if (event.pointerId !== this.press?.pointerId) return;
    this.stop();
  };

  private onTouchMove = (event: TouchEvent) => {
    if (this.isDragging) event.preventDefault();
  };

  private cancel = (event: Event) => {
    event.preventDefault();
  };

  private onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    this.stop();
  };

  private begin() {
    const source = this.press?.source;
    const row = source === undefined ? null : this.handlers.row(source);
    if (source === undefined || !row) {
      this.release();
      return;
    }
    window.clearTimeout(this.press!.hold);

    const rect = row.getBoundingClientRect();
    const custom = this.handlers.ghost?.(source);
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
    this.isDragging = true;
    this.handlers.start?.(source);
    this.scroller = scrollerOf(this.handlers.scrollArea?.() ?? null, this.axis === 'horizontal');
    this.scrollFrame = requestAnimationFrame(this.autoScroll);
    window.addEventListener('keydown', this.onKeyDown, true);
  }

  private placeGhost() {
    if (!this.ghost) return;
    this.ghost.style.transform = `translate(${this.point.x - this.ghostOffset.x}px, ${this.point.y - this.ghostOffset.y}px)`;
  }

  // Scrolls the scroller while the pointer sits in the band at either end of it
  private autoScroll = () => {
    if (!this.isDragging) return;
    this.scrollFrame = requestAnimationFrame(this.autoScroll);

    const scroller = this.scroller;
    if (!scroller) return;
    const horizontal = this.axis === 'horizontal';
    const page = scroller === document.scrollingElement;
    const rect = page
      ? {left: 0, top: 0, right: innerWidth, bottom: innerHeight}
      : scroller.getBoundingClientRect();
    const [at, start, end] = horizontal
      ? [this.point.x, rect.left, rect.right]
      : [this.point.y, rect.top, rect.bottom];

    const into = at < start + SCROLL_EDGE ? at - (start + SCROLL_EDGE) : at > end - SCROLL_EDGE ? at - (end - SCROLL_EDGE) : 0;
    if (!into) return;
    const by = Math.max(-1, Math.min(1, into / SCROLL_EDGE)) * SCROLL_SPEED;
    const before = horizontal ? scroller.scrollLeft : scroller.scrollTop;
    scroller.scrollBy(horizontal ? {left: by} : {top: by});
    if ((horizontal ? scroller.scrollLeft : scroller.scrollTop) !== before) this.handlers.move(this.point);
  };

  private finish(cancel: boolean) {
    if (!this.isDragging) return;
    this.isDragging = false;
    cancelAnimationFrame(this.scrollFrame);
    window.removeEventListener('keydown', this.onKeyDown, true);
    this.ghost?.remove();
    this.shield?.remove();
    this.ghost = null;
    this.shield = null;
    this.scroller = null;
    this.handlers.end(this.point, cancel);
  }

  // Stops tracking the press, whether or not it became a drag
  private release() {
    if (this.press) window.clearTimeout(this.press.hold);
    this.press = null;
    window.removeEventListener('pointermove', this.onPointerMove, true);
    window.removeEventListener('pointerup', this.onPointerUp, true);
    window.removeEventListener('pointercancel', this.onPointerCancel, true);
    window.removeEventListener('touchmove', this.onTouchMove, true);
    window.removeEventListener('dragstart', this.cancel, true);
    this.pressRoot?.removeEventListener('selectstart', this.cancel, true);
    this.pressRoot = null;
    if (this.userSelect !== null) document.documentElement.style.setProperty('-webkit-user-select', this.userSelect);
    this.userSelect = null;
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
