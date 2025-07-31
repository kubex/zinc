import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property} from "lit/decorators.js";
import ZincElement from '../../internal/zinc-element';

import styles from './status-indicator.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/status-indicator
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
export default class ZnStatusIndicator extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property() type: 'success' | 'error' | 'warning' | 'info' = 'info';

  render() {
    return html`
      <div class=${classMap({
        'indicator': true,
        'indicator--warning': this.type === 'warning',
        'indicator--error': this.type === 'error',
        'indicator--success': this.type === 'success',
        'indicator--info': this.type === 'info',
      })}>
      </div>
    `;
  }
}
