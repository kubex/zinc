import type {ReactiveController, ReactiveElement} from 'lit';

const MIN_THUMB = 24;
const GAP = 2;

type Axis = 'x' | 'y';

// A fractional scroll position can pass the integer max, and a thumb pushed past its track overflows the
// containing block, which flickers that block's own scrollbars on and off as the thumb is re-placed
const progress = (scroll: number, max: number) => Math.min(1, Math.max(0, scroll / max));

/**
 * Draws a scroller's scrollbars over its content, so the content keeps its full size. A styled native scrollbar
 * always takes its own room, so the native ones are hidden and thumbs, inserted as the scroller's next siblings,
 * stand in for them. Styled by `wc.scrollbars`.
 */
export class OverlayScrollbarController implements ReactiveController {
  private scroller: HTMLElement | null = null;
  private readonly thumbs: Record<Axis, HTMLElement>;
  private frame: number | null = null;
  private scrollingTimer: number | null = null;
  // The content grows as it loads, which moves no scroll position, so its size is watched too
  private readonly resizeObserver = new ResizeObserver(() => this.sync());
  private readonly mutationObserver = new MutationObserver(() => this.observeContent());

  private readonly host: ReactiveElement;
  private readonly getScroller: () => HTMLElement | null | undefined;

  constructor(host: ReactiveElement, getScroller: () => HTMLElement | null | undefined) {
    this.host = host;
    this.getScroller = getScroller;
    this.thumbs = {y: this.createThumb('y'), x: this.createThumb('x')};
    host.addController(this);
  }

  private createThumb(axis: Axis) {
    const thumb = document.createElement('div');
    thumb.className = `zn-overlay-scrollbar zn-overlay-scrollbar--${axis}`;
    thumb.setAttribute('part', 'scrollbar');
    thumb.setAttribute('aria-hidden', 'true');
    thumb.hidden = true;
    thumb.addEventListener('pointerdown', e => this.handleThumbDown(e, axis));
    return thumb;
  }

  hostConnected() {
    if (this.host.hasUpdated) {
      this.attach(this.getScroller() ?? null);
    }
  }

  hostUpdated() {
    const scroller = this.getScroller() ?? null;
    if (scroller !== this.scroller || !this.thumbs.y.isConnected) {
      this.attach(scroller);
    }
  }

  hostDisconnected() {
    this.attach(null);
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    if (this.scrollingTimer !== null) clearTimeout(this.scrollingTimer);
    this.frame = null;
    this.scrollingTimer = null;
  }

  private attach(scroller: HTMLElement | null) {
    const previous = this.scroller;
    if (previous) {
      previous.removeAttribute('data-overlay-scrollbar');
      previous.removeEventListener('scroll', this.handleScroll);
      previous.removeEventListener('pointerenter', this.sync);
      previous.removeEventListener('wheel', this.sync);
    }
    this.resizeObserver.disconnect();
    this.mutationObserver.disconnect();
    this.thumbs.y.remove();
    this.thumbs.x.remove();

    this.scroller = scroller;
    if (!scroller) return;
    scroller.setAttribute('data-overlay-scrollbar', '');
    scroller.addEventListener('scroll', this.handleScroll, {passive: true});
    scroller.addEventListener('pointerenter', this.sync);
    // A wheel that reaches the end scrolls an outer scroller, which moves this one without a scroll of its own
    scroller.addEventListener('wheel', this.sync, {passive: true});
    scroller.after(this.thumbs.y, this.thumbs.x);
    this.mutationObserver.observe(scroller, {childList: true});
    this.observeContent();
  }

  private observeContent() {
    const scroller = this.scroller;
    if (!scroller) return;
    this.resizeObserver.observe(scroller);
    for (const child of Array.from(scroller.children)) {
      if (child instanceof HTMLSlotElement) {
        child.addEventListener('slotchange', this.handleSlotChange);
        child.assignedElements({flatten: true}).forEach(el => this.resizeObserver.observe(el));
      } else {
        this.resizeObserver.observe(child);
      }
    }
    this.sync();
  }

  private readonly handleSlotChange = () => this.observeContent();

  private readonly handleScroll = () => {
    this.sync();
    // Shown while scrolling, then left to fade as a native overlay scrollbar does
    this.thumbs.y.classList.add('zn-overlay-scrollbar--active');
    this.thumbs.x.classList.add('zn-overlay-scrollbar--active');
    if (this.scrollingTimer !== null) clearTimeout(this.scrollingTimer);
    this.scrollingTimer = window.setTimeout(() => {
      this.scrollingTimer = null;
      this.thumbs.y.classList.remove('zn-overlay-scrollbar--active');
      this.thumbs.x.classList.remove('zn-overlay-scrollbar--active');
    }, 800);
  };

  // Once a frame however often content and scroll positions change
  private readonly sync = () => {
    if (this.frame !== null) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = null;
      if (this.scroller) this.place(this.scroller);
    });
  };

  private place(scroller: HTMLElement) {
    const {x: thumbX, y: thumbY} = this.thumbs;
    const {scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth} = scroller;
    thumbY.hidden = scrollHeight <= clientHeight + 1;
    thumbX.hidden = scrollWidth <= clientWidth + 1;
    if (thumbY.hidden && thumbX.hidden) return;

    // Measured from where the thumbs sit untranslated, so it holds whatever their containing block is
    thumbY.style.transform = 'none';
    thumbX.style.transform = 'none';
    const origin = (thumbY.hidden ? thumbX : thumbY).getBoundingClientRect();
    const box = scroller.getBoundingClientRect();
    const scale = box.width / scroller.offsetWidth || 1;
    const left = (box.left - origin.left) / scale + scroller.clientLeft;
    const top = (box.top - origin.top) / scale + scroller.clientTop;

    if (!thumbY.hidden) {
      const track = clientHeight - (thumbX.hidden ? 0 : thumbX.offsetHeight + GAP);
      const size = Math.max(MIN_THUMB, track * clientHeight / scrollHeight);
      const travel = progress(scrollTop, scrollHeight - clientHeight) * (track - size);
      thumbY.style.height = `${size}px`;
      thumbY.style.transform = `translate(${left + clientWidth - thumbY.offsetWidth - GAP}px, ${top + travel}px)`;
    }
    if (!thumbX.hidden) {
      const track = clientWidth - (thumbY.hidden ? 0 : thumbY.offsetWidth + GAP);
      const size = Math.max(MIN_THUMB, track * clientWidth / scrollWidth);
      const travel = progress(Math.abs(scrollLeft), scrollWidth - clientWidth) * (track - size);
      thumbX.style.width = `${size}px`;
      thumbX.style.transform = `translate(${left + travel}px, ${top + clientHeight - thumbX.offsetHeight - GAP}px)`;
    }
  }

  private handleThumbDown(e: PointerEvent, axis: Axis) {
    const scroller = this.scroller;
    if (!scroller) return;
    const thumb = this.thumbs[axis];
    e.preventDefault();
    thumb.setPointerCapture(e.pointerId);
    thumb.classList.add('zn-overlay-scrollbar--dragging');
    const vertical = axis === 'y';
    const start = vertical ? e.clientY : e.clientX;
    const startScroll = vertical ? scroller.scrollTop : scroller.scrollLeft;
    const scrollSize = vertical ? scroller.scrollHeight : scroller.scrollWidth;
    const clientSize = vertical ? scroller.clientHeight : scroller.clientWidth;
    const thumbSize = vertical ? thumb.offsetHeight : thumb.offsetWidth;
    const scale = scroller.getBoundingClientRect().width / scroller.offsetWidth || 1;
    const ratio = (scrollSize - clientSize) / Math.max(1, clientSize - thumbSize) / scale;
    const move = (ev: PointerEvent) => {
      const delta = ((vertical ? ev.clientY : ev.clientX) - start) * ratio;
      if (vertical) scroller.scrollTop = startScroll + delta;
      else scroller.scrollLeft = startScroll + delta;
    };
    thumb.addEventListener('pointermove', move);
    thumb.addEventListener('lostpointercapture', () => {
      thumb.removeEventListener('pointermove', move);
      thumb.classList.remove('zn-overlay-scrollbar--dragging');
    }, {once: true});
  }
}
