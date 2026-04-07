import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';

import styles from './cols.scss';

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

  @property({attribute: 'mc', type: Number, reflect: true}) maxColumns: number = 0;

  @property({attribute: 'no-gap', type: Boolean}) noGap: boolean = false;

  @property({type: Boolean}) border: boolean = false;

  @property({type: Boolean}) pad: boolean;

  @property({type: Boolean}) divide: boolean = false;

  @property({attribute: 'pad-x', type: Boolean}) padX: boolean;

  @property({attribute: 'pad-y', type: Boolean}) padY: boolean;

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
    });

    return html`
      <div class="${classMap({
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
