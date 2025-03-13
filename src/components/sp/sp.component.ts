import {property} from 'lit/decorators.js';
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import ZincElement from '../../internal/zinc-element';

import styles from './sp.scss';
import {classMap} from "lit/directives/class-map.js";

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/sp
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
export default class ZnSp extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({attribute: 'divide', type: Boolean, reflect: true}) divide: boolean = false;
  @property({attribute: 'row', type: Boolean, reflect: true}) row: boolean = false;
  @property({attribute: 'grow', type: Boolean, reflect: true}) grow: boolean = false;
  @property({attribute: 'pad-x', type: Boolean, reflect: true}) padX: boolean = false;
  @property({attribute: 'pad-y', type: Boolean, reflect: true}) padY: boolean = false;
  @property({attribute: 'no-gap', type: Boolean, reflect: true}) noGap: boolean = false;
  @property({attribute: 'flush', type: Boolean, reflect: true}) flush: boolean = false;
  @property({attribute: 'flush-x', type: Boolean, reflect: true}) flushX: boolean = false;
  @property({attribute: 'flush-y', type: Boolean, reflect: true}) flushY: boolean = false;

  connectedCallback() {
    super.connectedCallback();
    if (this.divide) {
      this.classList.add('zn-divide');
    }

    if (this.padX) {
      this.classList.add('zn-c-pad');
      this.classList.add('zn-c-pad-x');
    }

    if (this.padY) {
      this.classList.add('zn-c-pad');
      this.classList.add('zn-c-pad-y');
    }
  }

  protected render(): unknown {
    return html`
      <div class="${classMap({
        'sp': true,
        'sp--divide': this.divide,
        'sp--row': this.row,
        'sp--grow': this.grow,
        'sp--no-gap': this.noGap,
        'sp--pad-x': this.padX,
        'sp--pad-y': this.padY,
        'sp--flush': this.flush,
        'sp--flush-y': this.flushY,
        'sp--flush-x': this.flushX
      })}">
        <slot></slot>
      </div>`;
  }
}
