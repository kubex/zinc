import { property } from 'lit/decorators.js';
import { type CSSResultGroup, html, unsafeCSS } from 'lit';
import ZincElement from '../../internal/zinc-element';

import styles from './action-item.scss?inline';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/action-item
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
export default class ZnActionItem extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({ attribute: 'caption', type: String, reflect: true }) caption: string = ""; // Caption
  @property({ attribute: 'description', type: String, reflect: true }) description: string = ""; // Description
  @property({ attribute: 'uri', type: String, reflect: true }) uri: string = ""; // Uri

  protected render() {
    return html`
      <div class="ai">
        <a href="${this.uri}" class="ai__link">
          <div class="ai__left">
            <span class="ai__caption">${this.caption}</span>
            <span class="ai__description">${this.description}</span>
          </div>
          <div class="ai__right">
            <zn-icon library="material-outlined" src="arrow_forward" size="22"></zn-icon>
          </div>
        </a>
      </div>
    `;
  }
}
