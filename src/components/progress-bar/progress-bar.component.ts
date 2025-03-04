import {property} from 'lit/decorators.js';
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import ZincElement from '../../internal/zinc-element';

import styles from './progress-bar.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/progress-bar
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
export default class ZnProgressBar extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({type: String, reflect: true}) caption: string | undefined;
  @property({type: String, reflect: true}) description: string | undefined;
  @property({type: Number, reflect: true}) value: number | undefined;
  @property({type: Boolean, reflect: true, attribute: 'show-progress'})
  showProgress: boolean | undefined;

  render() {
    return html`
      ${this.caption || this.showProgress
        ? html`
          <div class="header">
            <p class="caption">${this.caption}</p>
            ${this.showProgress
              ? html`
                <p class="progress">${this.value}%</p> `
              : ''}
          </div>
        `
        : ''}
      <svg width="100%" height="8">
        <defs>
          <clipPath id="clip-path">
            <rect width="100%" height="8px" rx="4px"/>
          </clipPath>
        </defs>
        <rect
          fill="rgba(var(--zn-border-color))"
          width="100%"
          height="100%"
          rx="4px"
        />
        <rect
          fill='rgb(var(--zn-primary))'
          width="${this.value}%"
          height="100%"
          clip-path="url(#clip-path)"
          rx="4px"
        />
      </svg>
      ${this.description
        ? html`
          <div class="footer">
            ${this.description
              ? html`
                <p class="info">
                  ${this.description}
                </p>`
              : ''}
          </div>
        `
        : ''}
    `;
  }
}
