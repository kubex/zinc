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
   * than the description with `color`. `tile` is a self-contained card: caption, amount, a footer with the delta and
   * `description`, an optional sparkline, and the default slot beneath. */
  @property({reflect: true}) layout: 'default' | 'value-first' | 'tile' = 'default';

  /** Comma-separated values drawn as a sparkline under a `tile`. */
  @property() spark = '';

  /** The sparkline's colour: a tone (`primary`, `info`, `success`, `warning`, `danger`, `ai`) or any CSS colour. */
  @property({attribute: 'spark-color'}) sparkColor = '';

  /** Treats a rise as bad news, so an increase is coloured as a loss (declines, refunds, failures). */
  @property({type: Boolean, attribute: 'invert-delta'}) invertDelta = false;

  /** A coloured dot before a `tile`'s caption. */
  @property({reflect: true}) tone: '' | 'info' | 'success' | 'warning' | 'danger' | 'neutral' = '';

  /** Renders a `tile` as a toggle button, for tiles that filter the content below them. */
  @property({type: Boolean}) selectable = false;

  /** Whether a `selectable` tile is pressed, or a linked tile marks the view the page is showing. */
  @property({type: Boolean, reflect: true}) selected = false;

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

  /** Makes the whole stat a link, marked with an arrow in its corner. */
  @property() href: string;

  @property({attribute: 'data-target'}) dataTarget: string;

  @property() gaid: string;

  // Amounts are display strings, so drop separators and symbols ("48,201", "$2,941") before comparing.
  private parseNumber(value: string) {
    return parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  }

  calcPercentageDifference() {
    const previous = this.parseNumber(this.previous);
    const amount = this.parseNumber(this.amount);

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
    const diff = Math.round((this.parseNumber(this.amount) - this.parseNumber(this.previous)) * 10) / 10;
    if (diff > 0) {
      return html`<span class="positive">+${diff} pts</span>`;
    }
    if (diff < 0) {
      return html`<span class="negative">-${Math.abs(diff)} pts</span>`;
    }
    return html`<span class="neutral">No change</span>`;
  }

  private renderAmount() {
    return html`<span class="value">${this.getDisplayAmount()}${this.icon ? html`
      <zn-icon class="icon" src="${this.icon}" size="20" color="${ifDefined(this.iconColor)}"></zn-icon>` : null}</span>`;
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

  private tileDelta() {
    if (!this.showDelta) {
      return null;
    }

    const points = this.deltaFormat === 'points';
    const diff = points
      ? Math.round((this.parseNumber(this.amount) - this.parseNumber(this.previous)) * 10) / 10
      : this.calcPercentageDifference();
    const direction = diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat';
    const outcome = direction === 'flat' ? 'flat' : (direction === 'up') !== this.invertDelta ? 'good' : 'bad';
    const text = points ? `${Math.abs(diff)} pts` : `${Math.abs(diff)}%`;

    return html`
      <span class="delta delta--${outcome}">
        ${direction === 'flat' ? null : html`
          <zn-icon src="${direction === 'up' ? 'arrow-up-right@lu' : 'arrow-down-right@lu'}" size="14"></zn-icon>`}
        ${text}
      </span>`;
  }

  private sparkStroke() {
    const tones: Record<string, string> = {
      primary: 'var(--zn-chart-color-1, rgb(var(--zn-primary)))',
      info: 'var(--zn-chart-color-1, rgb(var(--zn-color-info)))',
      success: 'var(--zn-chart-color-2, rgb(var(--zn-color-success)))',
      ai: 'var(--zn-chart-color-3, rgb(var(--zn-color-ai)))',
      warning: 'var(--zn-chart-color-4, rgb(var(--zn-color-warning)))',
      danger: 'var(--zn-chart-color-5, rgb(var(--zn-color-error)))',
      error: 'var(--zn-chart-color-5, rgb(var(--zn-color-error)))',
    };
    return tones[this.sparkColor] ?? (this.sparkColor || tones.primary);
  }

  private renderSpark() {
    const data = this.spark.split(',').map(v => parseFloat(v)).filter(v => !Number.isNaN(v));
    if (data.length < 2) {
      return null;
    }

    const width = 100;
    const height = 28;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const line = data
      .map((v, i) => `${i ? 'L' : 'M'}${((i / (data.length - 1)) * width).toFixed(1)} ${(height - 3 - ((v - min) / range) * (height - 6)).toFixed(1)}`)
      .join(' ');
    const color = this.sparkStroke();

    return html`
      <div class="spark" part="spark">
        <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="spark-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" style="stop-color: ${color}; stop-opacity: .22"></stop>
              <stop offset="1" style="stop-color: ${color}; stop-opacity: 0"></stop>
            </linearGradient>
          </defs>
          <path d="${line} L${width} ${height} L0 ${height} Z" fill="url(#spark-fill)"></path>
          <path d="${line}" fill="none" style="stroke: ${color}" stroke-width="1.75"
                vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"></path>
        </svg>
      </div>`;
  }

  private renderTile() {
    const delta = this.tileDelta();
    const classes = classMap({
      'stat-tile': true,
      'stat-tile--card': true,
      'stat-tile--selectable': this.selectable,
      [`stat-tile--tone-${this.tone}`]: !!this.tone,
    });
    const body = html`
      <span class="caption" part="caption">${this.caption}</span>
      <span class="amount" part="amount">${this.renderAmount()}</span>
      ${delta || this.description ? html`
        <span class="foot" part="foot">${delta}${this.description ? html`<span>${this.description}</span>` : null}</span>` : null}
      ${this.renderSpark()}
      <slot></slot>`;

    return this.selectable
      ? html`<button type="button" part="base" class="${classes}" aria-pressed="${this.selected ? 'true' : 'false'}"
                     @click="${() => { this.selected = !this.selected; }}">${body}</button>`
      : html`<div part="base" class="${classes}">${body}</div>`;
  }

  render() {
    const tile = this.layout === 'tile'
      ? this.renderTile()
      : this.layout === 'value-first' ? this.renderValueFirst() : this.renderDefault();
    if (!this.href) {
      return tile;
    }

    return html`
      <a class="stat-link" part="link" href="${this.href}" data-target="${ifDefined(this.dataTarget)}"
         gaid="${ifDefined(this.gaid)}">
        ${tile}
        <zn-icon class="stat-link__icon" src="arrow-up-right@lu" size="${this.layout === 'tile' ? 18 : 16}" aria-hidden="true"></zn-icon>
      </a>`;
  }

  private renderDefault() {
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
