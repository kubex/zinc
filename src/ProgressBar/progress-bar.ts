import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss';

@customElement('zn-progress-bar')
export class ProgressBar extends LitElement
{
  static styles = unsafeCSS(styles);

  @property({type: String, reflect: true}) caption: string | undefined;
  @property({type: String, reflect: true}) description: string | undefined;
  @property({type: Number, reflect: true}) value: number | undefined;
  @property({type: Boolean, reflect: true, attribute: 'show-progress'})
  showProgress: boolean | undefined;

  render()
  {
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
          fill="rgba(var(--zn-input-bg))"
          width="100%"
          height="100%"
          rx="4px"
        />
        <rect
          fill='rgb(var(--zn-primary))'
          width="${this.value}%"
          height="100%"
          clip-path="url(#clip-path)"
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


