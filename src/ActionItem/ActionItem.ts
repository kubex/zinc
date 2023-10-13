import {html, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss';
import {ZincElement} from "../zinc";

@customElement('zn-action-item')
export class ActionItem extends ZincElement
{
  static styles = unsafeCSS(styles);

  @property({attribute: 'caption', type: String, reflect: true}) caption: string = ""; // Caption
  @property({attribute: 'description', type: String, reflect: true}) description: string = ""; // Description
  @property({attribute: 'uri', type: String, reflect: true}) uri: string = ""; // Uri


  protected render()
  {

    return html`
      <div class="action-item">
        <a href="${this.uri}" class="ai__link">
          <div class="ai__left">
            <span class="ai__caption">${this.caption}</span>
            <span class="ai__description">${this.description}</span>
          </div>
          <div class="ai__right">
            <zn-icon library="material-outlined" src="arrow_forward" size="18"></zn-icon>
          </div>
        </a>
      </div>
    `;
  }
}


