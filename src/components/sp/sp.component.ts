import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';

import styles from './sp.scss';

// TODO Move this somewhere shared
export const defaultSizes = {
  px: '1',
  xxs: '3',
  xs: '5',
  sm: '10',
  md: '15',
  lg: '20',
  xl: '25'
}

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
  @property({attribute: 'gap', reflect: true}) gap: keyof typeof defaultSizes;
  @property({attribute: 'row', type: Boolean, reflect: true}) row: boolean = false;
  @property({attribute: 'grow', type: Boolean, reflect: true}) grow: boolean = false;
  @property({attribute: 'pad-x', type: Boolean, reflect: true}) padX: boolean = false;
  @property({attribute: 'pad-y', type: Boolean, reflect: true}) padY: boolean = false;
  @property({attribute: 'no-gap', type: Boolean, reflect: true}) noGap: boolean = false;
  @property({attribute: 'flush', type: Boolean, reflect: true}) flush: boolean = false;
  @property({attribute: 'flush-x', type: Boolean, reflect: true}) flushX: boolean = false;
  @property({attribute: 'flush-y', type: Boolean, reflect: true}) flushY: boolean = false;
  @property({attribute: 'flush-t', type: Boolean, reflect: true}) flushT: boolean = false;
  @property({attribute: 'flush-b', type: Boolean, reflect: true}) flushB: boolean = false;
  @property({attribute: 'flush-l', type: Boolean, reflect: true}) flushL: boolean = false;
  @property({attribute: 'flush-r', type: Boolean, reflect: true}) flushR: boolean = false;
  @property({attribute: 'width-container', type: Boolean, reflect: true}) widthContainer: boolean = false;
  @property({attribute: 'form-container', type: Boolean, reflect: true}) formContainer: boolean = false;
  @property({attribute: 'wide-form-container', type: Boolean, reflect: true}) wideFormContainer: boolean = false;

  connectedCallback() {
    if (this.gap) {
      const size = defaultSizes[this.gap];
      if (size) {
        const gap = parseInt(size) * 4;
        this.style.setProperty('--zn-divide-gap', `${gap}px`);
      }
    }
    super.connectedCallback();
  }

  protected render(): unknown {
    return html`
      <div part="base" class="${classMap({
        'sp': true,
        'sp--divide': this.divide,
        'sp--row': this.row,
        'sp--grow': this.grow,
        'sp--no-gap': this.noGap,
        'sp--flush': this.flush,
        'sp--flush-y': this.flushY,
        'sp--flush-x': this.flushX,
        'sp--flush-t': this.flushT,
        'sp--flush-b': this.flushB,
        'sp--flush-l': this.flushL,
        'sp--flush-r': this.flushR,
        'width-container': this.widthContainer,
        'form-container': this.formContainer,
        'wide-form-container': this.wideFormContainer,
      })}">
        <slot></slot>
      </div>`;
  }
}
