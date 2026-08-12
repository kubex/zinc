import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';

import styles from './cols.scss';

/**
 * Priority keywords accepted by the `stack-order` attribute on children.
 */
const STACK_ORDER_KEYWORDS: Record<string, number> = {
  first: -1,
  high: -1,
  last: 1,
  low: 1,
};

const DEFAULT_STACK_AT = 'lg';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/columns
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-example
 *
 * @event zn-event-name - Emitted as an example.
 *
 * @slot - The default slot.
 * @slot example - An example slot.
 *
 * @csspart base - The component's base wrapper.
 *
 * @cssproperty --example - An example CSS custom property.
 */
export default class ZnCols extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({reflect: true, attribute: 'layout'}) layout: string = '';

  /**
   * Container width the columns collapse to a single column below, as one of the named zinc
   * container sizes (sm, smp, ph, md, lg, hd, 3k, 4k). Defaults to `lg` when a child declares
   * `stack-order` or `stack-split`, otherwise the columns never explicitly stack.
   */
  @property({attribute: 'stack-at', reflect: true}) stackAt: string = '';

  @property({attribute: 'mc', type: Number, reflect: true}) maxColumns: number = 0;

  @property({attribute: 'no-gap', type: Boolean}) noGap: boolean = false;

  @property({type: Boolean}) border: boolean = false;

  @property({type: Boolean}) pad: boolean;

  @property({type: Boolean}) divide: boolean = false;

  @property({attribute: 'pad-x', type: Boolean}) padX: boolean;

  @property({attribute: 'pad-y', type: Boolean}) padY: boolean;

  // Column classes and stack ordering are written onto our children, so a re-render is needed
  // whenever they change. Registered on the host and on each [stack-split] column, rather than
  // the whole subtree, to avoid reacting to unrelated content updates deeper in a column.
  private readonly childObserver: MutationObserver = new MutationObserver(() => this.requestUpdate());

  connectedCallback() {
    super.connectedCallback();
    this.childObserver.observe(this, {childList: true});
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.childObserver.disconnect();
  }

  /**
   * Reads the `stack-order` attribute of an element, returning null when it does not declare one.
   */
  private stackOrder(element: Element): number | null {
    const raw = element.getAttribute('stack-order');
    if (raw === null) return null;

    const keyword = raw.trim().toLowerCase();
    if (keyword in STACK_ORDER_KEYWORDS) return STACK_ORDER_KEYWORDS[keyword];

    const order = parseInt(keyword, 10);
    return isNaN(order) ? null : order;
  }

  /**
   * Applies the declared stack order to an element. `--zn-stacked` is 0 until the container
   * query in our stylesheet flips it to 1, so ordering only kicks in once stacked.
   */
  private applyStackOrder(element: HTMLElement, promoted: boolean): number | null {
    const order = this.stackOrder(element);
    element.style.order = order === null ? '' : `calc(var(--zn-stacked, 0) * ${order})`;

    // Children of a [stack-split] column become columns themselves when stacked, at which point
    // they need a basis to fill the row with. --zn-stack-basis is only set while stacked.
    if (promoted) {
      element.style.flexBasis = 'var(--zn-stack-basis, auto)';
    }

    return order;
  }

  render() {
    const layout: number[] = this.layout.split(/[\s,]+/).map((a) => parseInt(a)).filter((item) => !!item);

    if (layout.length === 0) {
      layout.push(1, 1, 1, 1);
    }

    this.layout = layout.join(',');

    this.maxColumns = layout.reduce((a, b) => a + b, 0);

    const prefix = 'zn-col-';
    // Only count children slotted into the default slot (no slot attribute)
    const children = Array.from(this.querySelectorAll(':scope > *:not([slot])')) as HTMLElement[];
    const colsPerRow = layout.length;
    const lastRowStart = children.length - (children.length % colsPerRow || colsPerRow);

    let stacks = false;

    children.forEach((element, index) => {
      const classes = element.className.split(' ').filter((c) => !c.startsWith(prefix));
      element.className = classes.join(' ');

      const col = index % colsPerRow;
      element.classList.add(prefix + layout[col]);

      // Clip overflow on last-row elements to hide the ::before border pseudo
      if(this.border && index >= lastRowStart) {
        element.style.overflow = 'hidden';
      } else {
        element.style.overflow = '';
      }

      stacks = this.applyStackOrder(element, false) !== null || stacks;

      if(element.hasAttribute('stack-split')) {
        stacks = true;
        this.childObserver.observe(element, {childList: true});
        Array.from(element.children).forEach((child) => this.applyStackOrder(child as HTMLElement, true));
      }
    });

    if(stacks && !this.stackAt) {
      this.stackAt = DEFAULT_STACK_AT;
    }

    return html`
      <div part="base" class="${classMap({
        'cols': true,
        'cols--no-gap': this.noGap,
        'cols--border': this.border,
        'cols--pad': this.pad,
        'cols--pad-x': this.padX,
        'cols--pad-y': this.padY,
        'cols--divide': this.divide,
        [`cols--layout-${this.layout.replaceAll(',', '')}`]: !!this.layout,
        [`cols--mc-${this.maxColumns}`]: !!this.maxColumns,
      })}">
        <slot></slot>
      </div>
    `;
  }
}
