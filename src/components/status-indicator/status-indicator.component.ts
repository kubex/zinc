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

  @property() type: 'success' | 'error' | 'warning' | 'info' | 'disabled' = 'info';

  /**
   * A secondary status type. When set, the indicator animates between `type`
   * and this colour to represent a status transitioning between two states
   * (e.g. `warning` and `disabled`).
   */
  @property({attribute: 'alt-type'}) altType?: 'success' | 'error' | 'warning' | 'info' | 'disabled';

  /** Animates a throbbing glow effect around the indicator. */
  @property({type: Boolean, reflect: true}) glow = false;

  render() {
    return html`
      <div class=${classMap({
        'indicator': true,
        'indicator--warning': this.type === 'warning',
        'indicator--error': this.type === 'error',
        'indicator--success': this.type === 'success',
        'indicator--info': this.type === 'info',
        'indicator--disabled': this.type === 'disabled',
        'indicator--alt-warning': this.altType === 'warning',
        'indicator--alt-error': this.altType === 'error',
        'indicator--alt-success': this.altType === 'success',
        'indicator--alt-info': this.altType === 'info',
        'indicator--alt-disabled': this.altType === 'disabled',
        'indicator--alternate': !!this.altType,
        'indicator--glow': this.glow,
      })}>
      </div>
    `;
  }
}
