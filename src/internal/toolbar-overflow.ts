import {ResizeController} from '@lit-labs/observers/resize-controller.js';
import type {ReactiveController, ReactiveControllerHost} from 'lit';

interface ToolbarOverflowOptions {
  /** The measurable group elements, in toolbar order. */
  groups: () => HTMLElement[];
  /** The element whose width the groups have to fit inside. */
  container: () => HTMLElement | null | undefined;
  /** Space to keep for the overflow trigger. Defaults to 44px. */
  reserve?: number;
}

/**
 * Reports how many leading toolbar groups fit the container, so the host can render the
 * rest into an overflow menu. Two passes: the first ignores the trigger, because when
 * everything fits there is no trigger to make room for.
 */
export class ToolbarOverflowController implements ReactiveController {
  visibleCount = Infinity;

  private readonly host: ReactiveControllerHost & Element;
  private readonly options: ToolbarOverflowOptions;
  private resizeRafId = 0;

  constructor(host: ReactiveControllerHost & Element, options: ToolbarOverflowOptions) {
    this.host = host;
    this.options = options;
    host.addController(this);
    // Deferred to a rAF rather than measuring inline: measure() mutates the display of
    // elements inside the observed host, and doing that synchronously in the observer's own
    // callback is what trips "ResizeObserver loop completed with undelivered notifications"
    // (fatal in WebKit's test runner, not just a console warning). Same fix as button-menu.
    // eslint-disable-next-line no-new -- ResizeController registers itself with the host.
    new ResizeController(host, {
      callback: () => {
        if (this.resizeRafId) return;
        this.resizeRafId = requestAnimationFrame(() => {
          this.resizeRafId = 0;
          this.measure();
        });
      },
    });
  }

  hostUpdated() {
    this.measure();
  }

  private measure() {
    const groups = this.options.groups();
    const container = this.options.container();
    if (!groups.length || !container) return;

    // clientWidth includes the container's own padding, so it has to come back out — and so
    // does any non-group sibling (the raw-source toggle, or the trigger itself once it
    // exists) that is really sitting in the same row and eating into the same space. Without
    // this, `total <= available` can read true while a sibling's real footprint still clips
    // trailing groups off-screen with no trigger rendered to reach them.
    const style = getComputedStyle(container);
    const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const siblingsWidth = [...container.children]
      .filter(child => !child.classList.contains('toolbar__group'))
      .reduce((sum, child) => sum + child.getBoundingClientRect().width, 0);
    const available = container.clientWidth - paddingX - siblingsWidth;
    if (available <= 0) return;

    // Show everything before measuring: a collapsed group measures 0, which would let the
    // next pass re-expand it and oscillate forever. Same reason the editor toolbar resets
    // display before each pass. Reads and writes stay in this frame, so nothing flickers.
    groups.forEach(group => (group.style.display = ''));
    const widths = groups.map(group => group.getBoundingClientRect().width);
    const total = widths.reduce((sum, width) => sum + width, 0);

    const next = total <= available
      ? groups.length
      : this.countThatFit(widths, available - (this.options.reserve ?? 44));

    groups.forEach((group, index) => (group.style.display = index < next ? '' : 'none'));

    if (next !== this.visibleCount) {
      this.visibleCount = next;
      this.host.requestUpdate();
    }
  }

  private countThatFit(widths: number[], available: number): number {
    let used = 0;
    let count = 0;
    for (const width of widths) {
      if (used + width > available) break;
      used += width;
      count++;
    }
    // No `Math.max(count, 1)` floor here: forcing at least one group into the bar when even
    // that group alone doesn't fit `available` pushed the trigger past the host's own
    // `overflow: hidden` edge — clipped and unreachable, not just visually tight. Zero visible
    // groups is the correct answer in that case; every action still reaches the menu.
    return count;
  }
}
