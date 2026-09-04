import { classMap } from "lit/directives/class-map.js";
import { type CSSResultGroup, html, type PropertyValues, unsafeCSS } from 'lit';
import { HasSlotController } from "../../internal/slot";
import { property } from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';

import formControlStyles from '../../form-control.scss';
import styles from './form-group.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/form-group
 * @status experimental
 * @since 1.0
 *
 * @slot - The default slot.
 * @slot chip - A chip displayed under the form group's help text.
 *
 * @csspart form-control-text - The column holding the label, help text and chip.
 *
 * @cssproperty --zn-form-group-sticky-top - Offset the label column sticks at while the inputs scroll past.
 *
 */
export default class ZnFormGroup extends ZincElement {
  static styles: CSSResultGroup = [unsafeCSS(formControlStyles), unsafeCSS(styles)];

  private readonly hasSlotController = new HasSlotController(this, 'help-text', 'label', 'chip');

  /**
   * The form group's label. Required for proper accessibility. If you need to display HTML, use the `label` slot
   * instead.
   */
  @property() label = '';

  /**
   * Text that appears in a tooltip next to the label. If you need to display HTML in the tooltip, use the
   * `label-tooltip` slot instead.
   */
  @property({ attribute: 'label-tooltip' }) labelTooltip = '';

  /** The form groups help text. If you need to display HTML, use the `help-text` slot instead. */
  @property({ attribute: 'help-text' }) helpText = '';
  @property({ attribute: 'cols', type: Boolean }) forceCols = false;
  @property({ attribute: 'layout', type: String }) layout = "1,2";

  @property({ attribute: 'pad', type: Boolean }) pad: boolean = false;

  /** The scroller the label is moved against by hand; null while native sticky is enough. */
  private tracked: HTMLElement | null = null;
  /** Set while the compositor is running the movement off a scroll timeline instead. */
  private animation: Animation | null = null;
  private stickyTop: number = 0;
  private frame: number = 0;
  private rebind: boolean = false;
  private offset: number = 0;
  private resizeObserver: ResizeObserver | null = null;

  connectedCallback() {
    super.connectedCallback();

    // Whether an ancestor scrolls depends on how tall this form has grown.
    this.resizeObserver ??= new ResizeObserver(() => this.schedule(true));
    this.resizeObserver.observe(this);
    window.addEventListener('resize', this.onViewportResize);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
    window.removeEventListener('resize', this.onViewportResize);
    this.detach();
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  protected firstUpdated(changedProperties: PropertyValues) {
    super.firstUpdated(changedProperties);
    this.schedule(true);
  }

  private get labelColumn(): HTMLElement | null {
    return this.shadowRoot?.querySelector('.form-control__text') ?? null;
  }

  /** Coalesces scroll and resize work into one frame, and out of the ResizeObserver callback. */
  private schedule(rebind: boolean = false) {
    this.rebind ||= rebind;
    if (this.frame) return;

    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      if (this.rebind) {
        this.rebind = false;
        this.bind();
      }
      this.positionLabel();
    });
  }

  /**
   * Native sticky only follows the nearest scroll container. Where that container isn't the one
   * the user actually scrolls — a `zn-panel` body sized to its content inside a scrolling
   * slideout, say — the label never moves, so it is moved against the real scroller instead.
   */
  private bind() {
    const column = this.labelColumn;
    if (!column) return;

    // Measured with nothing of ours on the label, so what follows reads its resting position.
    this.detach();
    column.style.top = '';
    this.stickyTop = parseFloat(getComputedStyle(column).top) || 0;

    const anchor = this.nearestScrollContainer(column);
    if (!anchor) return;

    const scroller = this.scrollingAncestor(column);
    if (scroller === anchor) return;

    // A `top` inset against a box that never scrolls has nothing to hold the label back from:
    // it only pushes the label down the page, so drop it and stand in for sticky below.
    column.style.top = '0px';
    if (!scroller) return;

    this.tracked = scroller;

    /*
     * Scrolling is composited, so a transform written from a scroll handler lands a frame late and the label swims
     * against the fields. A scroll timeline hands the same movement to the compositor; the handler is the fallback
     * for browsers without one.
     */
    this.animation = this.scrollLinkedTravel(scroller);
    if (this.animation) {
      this.animation.play();
      // Content arriving above the form moves the scroll position the label has to start from, and nothing resizes
      // to say so. Re-measured at the end of a gesture, which is the soonest it can be seen.
      this.scrollTarget(scroller)?.addEventListener('scrollend', this.onScrollEnd, { passive: true });
      return;
    }

    this.scrollTarget(scroller)?.addEventListener('scroll', this.onScroll, { passive: true });
  }

  /**
   * The label's whole journey, as the scroll positions it turns at: still until the fieldset's top reaches the sticky
   * line, then a pixel for every pixel of scroll until it has crossed the fieldset. `fill: both` holds it at either
   * end, which is the clamp the scroll handler applies by hand.
   */
  private scrollLinkedTravel(scroller: HTMLElement): Animation | null {
    const column = this.labelColumn;
    const fieldset = this.fieldset;
    if (!column || !fieldset || typeof ScrollTimeline === 'undefined') return null;

    // The stylesheet drops sticky while the columns are stacked, and there is nothing to follow.
    if (getComputedStyle(column).position !== 'sticky') return null;

    const travel = Math.max(0, fieldset.clientHeight - column.offsetHeight);
    const range = scroller.scrollHeight - scroller.clientHeight;
    if (travel < 1 || range < 1) return null;

    const start = scroller.scrollTop + column.getBoundingClientRect().top
      - this.visibleTop(scroller) - this.stickyTop;
    const held = (scroll: number) => Math.min(Math.max(scroll - start, 0), travel);

    const knees = [start, start + travel].filter(scroll => scroll > 0 && scroll < range);
    const keyframes = [0, ...knees, range].map(scroll => ({
      offset: Math.min(Math.max(scroll / range, 0), 1),
      transform: `translateY(${held(scroll)}px)`
    }));

    return new Animation(
      new KeyframeEffect(column, keyframes, { fill: 'both' }),
      new ScrollTimeline({ source: scroller, axis: 'block' })
    );
  }

  /** Drops everything this component has put on the label or on the scroller. */
  private detach() {
    const target = this.scrollTarget(this.tracked);
    target?.removeEventListener('scroll', this.onScroll);
    target?.removeEventListener('scrollend', this.onScrollEnd);
    this.tracked = null;

    this.animation?.cancel();
    this.animation = null;

    const column = this.labelColumn;
    if (!column) return;
    this.offset = 0;
    column.style.transform = '';
  }

  /** The document scrolls through the window, every other scroller reports its own events. */
  private scrollTarget(scroller: HTMLElement | null): EventTarget | null {
    if (!scroller) return null;
    return scroller === document.scrollingElement ? window : scroller;
  }

  /** Where the scroller's own top edge sits, which for the document is the top of the viewport. */
  private visibleTop(scroller: HTMLElement) {
    return scroller === document.scrollingElement ? 0 : scroller.getBoundingClientRect().top;
  }

  private get fieldset(): HTMLElement | null {
    return this.shadowRoot?.querySelector('.form-control') ?? null;
  }

  private readonly onScroll = () => this.schedule();

  private readonly onScrollEnd = () => this.schedule(true);

  // A shorter viewport can make an ancestor scrollable without changing this form's size.
  private readonly onViewportResize = () => this.schedule(true);

  private positionLabel() {
    if (this.animation) return;

    const column = this.labelColumn;
    const fieldset = this.fieldset;
    if (!column || !fieldset) return;

    let offset = 0;

    // The stylesheet drops sticky while the columns are stacked; tracking has to stand down too.
    if (this.tracked && getComputedStyle(column).position === 'sticky') {
      const visibleTop = this.visibleTop(this.tracked);
      const restingTop = column.getBoundingClientRect().top - this.offset;
      const travel = Math.max(0, fieldset.clientHeight - column.offsetHeight);

      offset = Math.min(Math.max(visibleTop + this.stickyTop - restingTop, 0), travel);
    }

    if (Math.round(offset) === Math.round(this.offset)) return;

    this.offset = offset;
    column.style.transform = offset ? `translateY(${offset}px)` : '';
  }

  /** The box native sticky would anchor to, whether or not it can be scrolled. */
  private nearestScrollContainer(from: HTMLElement): HTMLElement | null {
    return this.ancestors(from).find(element => {
      const style = getComputedStyle(element);
      return this.isScrollContainer(style.overflowY) || this.isScrollContainer(style.overflowX);
    }) ?? null;
  }

  /** The nearest ancestor the user can actually scroll, falling back to the document. */
  private scrollingAncestor(from: HTMLElement): HTMLElement | null {
    const scroller = this.ancestors(from).find(element => {
      const overflow = getComputedStyle(element).overflowY;
      return (overflow === 'auto' || overflow === 'scroll' || overflow === 'overlay')
        && element.scrollHeight > element.clientHeight + 1;
    });

    if (scroller) return scroller;

    const root = document.scrollingElement as HTMLElement | null;
    return root && root.scrollHeight > root.clientHeight + 1 ? root : null;
  }

  private isScrollContainer(overflow: string) {
    return overflow === 'auto' || overflow === 'scroll' || overflow === 'hidden' || overflow === 'overlay';
  }

  /** Walks the flattened tree, so slots and shadow boundaries are crossed the way layout does. */
  private ancestors(from: HTMLElement): HTMLElement[] {
    const out: HTMLElement[] = [];
    let node: Node | null = from;

    while (node) {
      const parent: Node | null = node instanceof Element && node.assignedSlot
        ? node.assignedSlot
        : node.parentNode instanceof ShadowRoot ? node.parentNode.host : node.parentNode;

      if (parent instanceof HTMLElement) out.push(parent);
      node = parent;
    }

    return out;
  }

  render() {
    const hasLabelSlot = this.hasSlotController.test('label');
    const hasLabelTooltipSlot = this.hasSlotController.test('label-tooltip');
    const hasHelpTextSlot = this.hasSlotController.test('help-text');
    const hasLabel = this.label ? true : hasLabelSlot;
    const hasLabelTooltip = this.labelTooltip ? true : hasLabelTooltipSlot;
    const hasHelpText = this.helpText ? true : hasHelpTextSlot;
    const hasChip = this.hasSlotController.test('chip');

    return html`
      <fieldset
        part="form-control"
        class="${classMap({
          'form-control': true,
          'form-control--has-label': hasLabel,
          'form-control--has-label-tooltip': hasLabelTooltip,
          'form-control--has-help-text': hasHelpText,
          'form-control--pad': this.pad
        })}"
        aria-labelledby="label"
        aria-describedby="help-text">

        <zn-cols layout="${this.layout}" part="form-control-container" class="form-control__container">
          ${hasLabel || hasHelpText || hasChip || this.forceCols ? html`
            <div part="form-control-text" class="form-control__text">

              ${hasLabel ? html`
                <label
                  part="form-control-label"
                  id="label"
                  class="form-control__label"
                  aria-hidden="${hasLabel ? 'false' : 'true'}">
                  <slot name="label">${this.label}</slot>
                  ${hasLabelTooltip
                    ? html`
                      <zn-tooltip class="form-control--label-tooltip">
                        <div slot="content">
                          <slot name="label-tooltip">${this.labelTooltip}</slot>
                        </div>
                        <zn-icon src="info"></zn-icon>
                      </zn-tooltip>`
                    : ''}
                </label>` : html``}

              ${hasHelpText ? html`
                <div
                  part="form-control-help-text"
                  id="help-text"
                  class="form-control__help-text">
                  <slot name="help-text">${this.helpText}</slot>
                </div>` : html``}

              ${hasChip ? html`
                <div
                  part="form-control-chip"
                  class="form-control__chip">
                  <slot name="chip"></slot>
                </div>` : html``}

            </div>` : html``}

          <div part="form-control-input" class="form-control-input">
            <slot></slot>
          </div>
        </zn-cols>
      </fieldset>`;
  }
}
