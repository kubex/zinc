import {property} from 'lit/decorators.js';
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import ZincElement from '../../internal/zinc-element';
import {classMap} from "lit/directives/class-map.js";

import styles from './stat.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/stats-tile
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
export default class ZnStatsTile extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property() caption = '';
  @property() description = '';
  @property() amount = '0';
  @property() type = 'number';
  @property() previous = '0';
  @property() currency = '';
  @property({type: Boolean, attribute: 'show-delta'}) showDelta = false;
  @property() color: 'primary' | 'error' | 'info' | 'warning' | 'success' | 'neutral' = 'primary';

  calcPercentageDifference() {
    const previous = parseFloat(this.previous);
    const amount = parseFloat(this.amount);

    let diff = ((amount - previous) / previous) * 100;
    diff = Math.round(diff * 10) / 10;

    return diff;
  }

  getCurrentAmount() {
    if (this.currency == "") {
      return this.amount;
    }
    // convert string to money
    const amount = parseFloat(this.amount);
    const currency = this.currency;

    const formattedAmount = amount.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${currency}${formattedAmount}`;
  }

  private getDisplayAmount() {
    if (this.currency !== '') {
      return this.getCurrentAmount();
    }
    if (this.type === 'percent') {
      return `${this.amount}%`;
    }

    if (this.type === 'time') {
      const seconds = parseInt(this.amount);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      if (hours <= 0) {
        return [minutes % 60, seconds % 60].map(v => v.toString().padStart(2, '0')).join(':') + 's';
      }

      return [hours, minutes % 60, seconds % 60].map(v => v.toString().padStart(2, '0')).join(':') + 's';
    }
    return this.amount;
  }

  diffText() {
    if (this.showDelta) {
      const diff = this.calcPercentageDifference();
      let diffClass = 'neutral';
      let diffIcon = '~';
      if (diff > 0) {
        diffClass = 'positive';
        diffIcon = '+';
      }

      if (diff < 0) {
        diffClass = 'negative';
        diffIcon = '-';
      }

      return html`<p class="diff"><span class="${diffClass}">${diffIcon}${diff}%</span> on Previous Period</p>`;
    }

    return null;
  }

  render() {
    return html`
      <div class="${classMap({
        'stat-tile': true,
        [`stat-tile--${this.color}`]: true
      })}">
        <div class="container">
          <div class="left">
            <div>
              <h3 class="caption">${this.caption}</h3>
              <p class="description">${this.description}</p>
            </div>
            <p class="amount">${this.getDisplayAmount()}</p>
            <p class="bottom">${this.diffText()}</p>
          </div>
        </div>
      </div>
    `;
  }
}
