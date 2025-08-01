import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property} from "lit/decorators.js";
import ZincElement from '../../internal/zinc-element';

import styles from './status-indicator.scss';

/**
 * @summary Circular status indicators.
 * @documentation https://zinc.style/components/status-indicator
 * @status experimental
 * @since 1.0
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
