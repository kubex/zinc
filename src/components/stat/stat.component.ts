import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {ifDefined} from "lit/directives/if-defined.js";
import {property} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import type {IconColor} from '../icon';

import styles from './stat.scss';

/**
 * @summary Displays a key metric, optionally compared with a previous value.
 * @documentation https://zinc.style/components/stats-tile
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-icon
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

  /** `value-first` puts the amount under the caption with the description beneath it, and tints the amount rather
   * than the description with `color`. */
  @property({reflect: true}) layout: 'default' | 'value-first' = 'default';

  /** How `show-delta` compares with `previous`: the relative change, or the difference in points. */
  @property({attribute: 'delta-format'}) deltaFormat: 'percent' | 'points' = 'percent';

  /** An icon shown beside the amount. */
  @property() icon = '';

  /** The icon's color; without one it takes the amount's. */
  @property({attribute: 'icon-color'}) iconColor: IconColor;

  /** `large` gives the amount more weight, for a summary row of a few headline figures. */
  @property({reflect: true}) size: 'medium' | 'large' = 'medium';

  /** Pads the stat, for stats laid edge to edge in a flush container such as `zn-cols no-gap divide`. */
  @property({type: Boolean}) padded = false;

  calcPercentageDifference() {
    const previous = parseFloat(this.previous);
    const amount = parseFloat(this.amount);

    let diff = ((amount - previous) / previous) * 100;
    diff = Math.round(diff * 10) / 10;

    return diff;
  }

  getCurrentAmount() {
    if (this.currency === "") {
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

      if (this.deltaFormat === 'points') {
        return html`<p class="diff">${this.pointsDelta()} on Previous Period</p>`;
      }

      return html`<p class="diff"><span class="${diffClass}">${diffIcon}${diff}%</span> on Previous Period</p>`;
    }

    return null;
  }

  private pointsDelta() {
    const diff = Math.round((parseFloat(this.amount) - parseFloat(this.previous)) * 10) / 10;
    if (diff > 0) {
      return html`<span class="positive">+${diff} pts</span>`;
    }
    if (diff < 0) {
      return html`<span class="negative">-${Math.abs(diff)} pts</span>`;
    }
    return html`<span class="neutral">No change</span>`;
  }

  private renderAmount() {
    return html`${this.getDisplayAmount()}${this.icon ? html`
      <zn-icon class="icon" src="${this.icon}" size="20" color="${ifDefined(this.iconColor)}"></zn-icon>` : null}`;
  }

  private renderValueFirst() {
    const delta = this.showDelta
      ? (this.deltaFormat === 'points' ? this.pointsDelta() : this.percentDelta())
      : null;

    return html`
      <div class="${classMap({
        'stat-tile': true,
        'stat-tile--value-first': true,
        'stat-tile--large': this.size === 'large',
        'stat-tile--padded': this.padded,
        [`stat-tile--${this.color}`]: true
      })}">
        <h3 class="caption">${this.caption}</h3>
        <p class="amount">${this.renderAmount()}${delta ? html`<span class="diff">${delta}</span>` : null}</p>
        ${this.description ? html`<p class="description">${this.description}</p>` : null}
      </div>
    `;
  }

  private percentDelta() {
    const diff = this.calcPercentageDifference();
    if (diff > 0) {
      return html`<span class="positive">+${diff}%</span>`;
    }
    if (diff < 0) {
      return html`<span class="negative">${diff}%</span>`;
    }
    return html`<span class="neutral">No change</span>`;
  }

  render() {
    if (this.layout === 'value-first') {
      return this.renderValueFirst();
    }

    return html`
      <div class="${classMap({
        'stat-tile': true,
        'stat-tile--large': this.size === 'large',
        'stat-tile--padded': this.padded,
        [`stat-tile--${this.color}`]: true
      })}">
        <div class="container">
          <div class="left">
            <div>
              <h3 class="caption">${this.caption}</h3>
              <p class="description">${this.description}</p>
            </div>
            <p class="amount">${this.renderAmount()}</p>
            <p class="bottom">${this.diffText()}</p>
          </div>
        </div>
      </div>
    `;
  }
}
