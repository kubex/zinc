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

  /** The scroll containers we have clipped, against the inline overflow each carried before. */
  private readonly clipped = new Map<HTMLElement, { x: string; y: string }>();
  private frame: number = 0;
  private resizeObserver: ResizeObserver | null = null;

  connectedCallback() {
    super.connectedCallback();

    // Whether an ancestor scrolls depends on how tall this form has grown.
    this.resizeObserver ??= new ResizeObserver(() => this.schedule());
    this.resizeObserver.observe(this);
    window.addEventListener('resize', this.onViewportResize);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
    window.removeEventListener('resize', this.onViewportResize);
    this.release([...this.clipped.keys()]);
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  protected firstUpdated(changedProperties: PropertyValues) {
    super.firstUpdated(changedProperties);
    this.schedule();
  }

  private get labelColumn(): HTMLElement | null {
    return this.shadowRoot?.querySelector('.form-control__text') ?? null;
  }

  /** Coalesces resize work into one frame, and out of the ResizeObserver callback. */
  private schedule() {
    if (this.frame) return;

    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.freeSticky();
    });
  }

  // A shorter viewport can make an ancestor scroll without changing this form's size.
  private readonly onViewportResize = () => this.schedule();

  /**
   * Native sticky anchors to the nearest scroll container, even one that cannot scroll — a `zn-panel` body sized to
   * its content, say — where it then holds the label still for the whole scroll. `overflow: clip` clips without
   * making a scroll container, so clipping those takes them out of sticky's search and the label follows the box the
   * user actually scrolls, moved by the compositor rather than by hand.
   */
  private freeSticky() {
    const column = this.labelColumn;
    if (!column) return;

    const dead: HTMLElement[] = [];

    for (const element of this.ancestors(column)) {
      if (!this.clipped.has(element) && !this.isStickyAnchor(element)) continue;

      // Scroll size reports the overflow through a clip, so a box that has grown into needing to scroll is handed
      // straight back — and sticky anchors to it, which is now the right answer.
      if (this.overflows(element)) break;

      dead.push(element);
    }

    this.release([...this.clipped.keys()].filter(element => !dead.includes(element)));
    dead.filter(element => !this.clipped.has(element)).forEach(element => this.clip(element));
  }

  private clip(element: HTMLElement) {
    // A second form group in the same container finds the first one's clip already inline. Recording it as what was
    // there before would leave the box clipped for good, so it counts as nothing to put back.
    const kept = (overflow: string) => overflow === 'clip' ? '' : overflow;
    this.clipped.set(element, { x: kept(element.style.overflowX), y: kept(element.style.overflowY) });
    element.style.overflowX = 'clip';
    element.style.overflowY = 'clip';

    // Scrolling has to go back the moment the box is short enough to need it.
    this.resizeObserver?.observe(element);
  }

  private release(elements: HTMLElement[]) {
    elements.forEach(element => {
      const inline = this.clipped.get(element);
      element.style.overflowX = inline?.x ?? '';
      element.style.overflowY = inline?.y ?? '';
      this.resizeObserver?.unobserve(element);
      this.clipped.delete(element);
    });
  }

  /** The box native sticky would anchor to, whether or not it can be scrolled. */
  private isStickyAnchor(element: HTMLElement) {
    const style = getComputedStyle(element);
    return this.isScrollContainer(style.overflowY) || this.isScrollContainer(style.overflowX);
  }

  private isScrollContainer(overflow: string) {
    return overflow === 'auto' || overflow === 'scroll' || overflow === 'hidden' || overflow === 'overlay';
  }

  private overflows(element: HTMLElement) {
    return element.scrollHeight > element.clientHeight + 1 || element.scrollWidth > element.clientWidth + 1;
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
