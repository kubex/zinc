import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';

import styles from './progress-bar.scss';

/**
 * @summary Progress bars provide visual feedback about the completion status of a task or process.
 * @documentation https://zinc.style/components/progress-bar
 * @status experimental
 * @since 1.0
 *
 * @csspart header - The header container that contains the caption and progress text.
 * @csspart caption - The caption text element.
 * @csspart progress - The progress percentage text element.
 * @csspart bar - The SVG element containing the progress bar.
 * @csspart track - The background track of the progress bar.
 * @csspart fill - The filled portion of the progress bar indicating progress.
 * @csspart footer - The footer container that contains the description.
 * @csspart info - The description text element.
 *
 * @cssproperty --zn-border-color - The color of the progress bar background track.
 * @cssproperty --zn-primary - The color of the progress bar fill.
 * @cssproperty --zn-text-heading - The color of the caption text.
 * @cssproperty --zn-text - The color of the progress percentage and description text.
 * @cssproperty --zn-spacing-x-small - The spacing between header/footer and the progress bar.
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
          <div part="header" class="header">
            <p part="caption" class="caption">${this.caption}</p>
            ${this.showProgress
              ? html`
                <p part="progress" class="progress">${this.value}%</p> `
              : ''}
          </div>
        `
        : ''}
      <svg part="bar" width="100%" height="8">
        <defs>
          <clipPath id="clip-path">
            <rect width="100%" height="8px" rx="4px"/>
          </clipPath>
        </defs>
        <rect
          part="track"
          fill="rgba(var(--zn-border-color))"
          width="100%"
          height="100%"
          rx="4px"
        />
        <rect
          part="fill"
          fill='rgb(var(--zn-primary))'
          width="${this.value}%"
          height="100%"
          clip-path="url(#clip-path)"
          rx="4px"
        />
      </svg>
      ${this.description
        ? html`
          <div part="footer" class="footer">
            ${this.description
              ? html`
                <p part="info" class="info">
                  ${this.description}
                </p>`
              : ''}
          </div>
        `
        : ''}
    `;
  }
}
