import {property} from 'lit/decorators.js';
import {type CSSResultGroup, unsafeCSS} from 'lit';
import ZincElement from '../../internal/zinc-element';

import styles from './sp.scss';

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

  @property({attribute: 'divide', type: Boolean, reflect: true}) divide: boolean;

  connectedCallback() {
    super.connectedCallback();
    if (this.divide) {
      this.classList.add('zn-divide');
    }
  }

  createRenderRoot() {
    return this;
  }
}
