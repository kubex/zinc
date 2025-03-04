import { property } from 'lit/decorators.js';
import { type CSSResultGroup, html, unsafeCSS } from 'lit';
import ZincElement from '../../internal/zinc-element';

import styles from './columns.scss';

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
export default class ZnColumns extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);


  @property({ type: String, reflect: true, attribute: "layout" }) layout: string = '';
  @property({ attribute: 'mc', type: Number, reflect: true }) maxColumns: number = 0;


  render() {
    const layout: number[] = this.layout.split(/[\s,]+/).map((a) => parseInt(a)).filter((item) => !!item);
    if (layout.length === 0) {
      layout.push(1, 1, 1, 1);
    }
    this.layout = layout.join('');
    this.maxColumns = Math.min(5, layout.reduce((a, b) => a + b, 0));

    const prefix = 'zn-col-';
    this.querySelectorAll(':scope > *').forEach((element: HTMLElement, index) => {
      const classes = element.className.split(' ').filter((c) => !c.startsWith(prefix));
      element.className = classes.join(' ');

      const col = index % layout.length;
      element.classList.add(prefix + layout[col]);
    });

    return html`
      <slot></slot>
    `;
  }
}
