import type {ReactiveController, ReactiveControllerHost} from 'lit';

export type PopoverHideReason = 'escape' | 'outside' | 'api';

interface AnchoredPopoverOptions {
  /** Selector, in the host's shadow root, of the element the popover hangs from. */
  trigger: string;
  /** Selector, in the host's shadow root, of the popover. */
  popover: string;
  /** The popover's rendered width in px, used to keep it on screen. */
  width: () => number;
  /** Which trigger edge the popover lines up with; it flips when that would run off screen. */
  align: 'start' | 'end';
  /** Called whenever the popover closes, with how it was closed. */
  onHide?: (reason: PopoverHideReason) => void;
  /**
   * Selectors, in the popover, tried in order for the element to focus once it opens. When set, focus goes back to the
   * trigger as it closes, unless it has already moved somewhere else.
   */
  focus?: string[];
}

/**
 * A fixed-position popover anchored under a trigger in the host's shadow root, closed by Escape or a click outside
 * both. Fixed so a panel's overflow can't clip it.
 */
export class AnchoredPopoverController implements ReactiveController {
  open = false;
  position = {top: 0, left: 0};
  private readonly host: ReactiveControllerHost & HTMLElement;
  private readonly opts: AnchoredPopoverOptions;
  private observed: HTMLElement | null = null;
  // Children such as zn-input render after the host, so the height settles later; refitting inside the callback
  // itself trips WebKit's ResizeObserver loop error
  private readonly resizes = new ResizeObserver(() => requestAnimationFrame(() => this.refit()));

  constructor(host: ReactiveControllerHost & HTMLElement, opts: AnchoredPopoverOptions) {
    this.host = host;
    this.opts = opts;
    host.addController(this);
  }

  hostConnected() {
    this.host.addEventListener('keydown', this.keydown);
    document.addEventListener('keydown', this.keydown);
    document.addEventListener('click', this.outsideClick);
    window.addEventListener('resize', this.reposition);
    window.addEventListener('scroll', this.reposition, true);
  }

  hostDisconnected() {
    this.host.removeEventListener('keydown', this.keydown);
    document.removeEventListener('keydown', this.keydown);
    document.removeEventListener('click', this.outsideClick);
    window.removeEventListener('resize', this.reposition);
    window.removeEventListener('scroll', this.reposition, true);
    this.resizes.disconnect();
    this.observed = null;
  }

  // The height is only known once rendered; a fixed popover running off the bottom can't be scrolled to
  hostUpdated() {
    const pop = this.open ? this.popover() : null;
    if (pop !== this.observed) {
      this.resizes.disconnect();
      if (pop) this.resizes.observe(pop);
      this.observed = pop;
    }
    this.refit();
  }

  private refit() {
    if (!this.open) return;
    const top = this.position.top;
    this.place();
    if (this.position.top !== top) {
      this.host.requestUpdate();
    }
  }

  get style(): string {
    return `top: ${this.position.top}px; left: ${this.position.left}px`;
  }

  show() {
    this.place();
    this.open = true;
    this.host.requestUpdate();
    const selectors = this.opts.focus;
    if (selectors) {
      void this.host.updateComplete.then(() => {
        const pop = this.popover();
        selectors.map(selector => pop?.querySelector<HTMLElement>(selector)).find(Boolean)?.focus();
      });
    }
  }

  hide(reason: PopoverHideReason = 'api') {
    if (!this.open) return;
    if (this.opts.focus && this.focusIsLost()) {
      this.focusTrigger();
    }
    this.open = false;
    this.host.requestUpdate();
    this.opts.onHide?.(reason);
  }

  trigger(): HTMLElement | null {
    return this.host.shadowRoot?.querySelector<HTMLElement>(this.opts.trigger) ?? null;
  }

  private popover(): HTMLElement | null {
    return this.host.shadowRoot?.querySelector<HTMLElement>(this.opts.popover) ?? null;
  }

  private focusIsLost(): boolean {
    const active = this.host.shadowRoot?.activeElement;
    if (active) return !!this.popover()?.contains(active);
    return !document.activeElement || document.activeElement === document.body;
  }

  private focusTrigger() {
    const trigger = this.trigger();
    (trigger?.shadowRoot?.querySelector<HTMLElement>('button, a') ?? trigger)?.focus();
  }

  private place() {
    const trigger = this.trigger();
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const width = this.opts.width();
    const start = rect.left;
    const end = rect.right - width;
    const fitsStart = start + width <= window.innerWidth - 8;
    const fitsEnd = end >= 8;
    const left = this.opts.align === 'start'
      ? (fitsStart || !fitsEnd ? start : end)
      : (fitsEnd || !fitsStart ? end : start);
    const height = this.popover()?.offsetHeight ?? 0;
    const below = rect.bottom + 4;
    const above = rect.top - 4 - height;
    let top = below;
    if (below + height > window.innerHeight - 8) {
      top = above >= 8 ? above : Math.max(8, window.innerHeight - height - 8);
    }
    this.position = {
      top,
      left: Math.max(8, Math.min(left, window.innerWidth - width - 8)),
    };
  }

  private outsideClick = (e: MouseEvent) => {
    if (!this.open) return;
    const path = e.composedPath();
    const pop = this.popover();
    const trigger = this.trigger();
    if ((pop && path.includes(pop)) || (trigger && path.includes(trigger))) return;
    this.hide('outside');
  };

  // Also bound on the host so it runs before an enclosing dialog's own Escape handling
  private keydown = (e: KeyboardEvent) => {
    if (e.key !== 'Escape' || !this.open) return;
    e.stopPropagation();
    e.preventDefault();
    this.hide('escape');
  };

  private reposition = () => {
    if (this.open) {
      this.place();
      this.host.requestUpdate();
    }
  };
}
