import {html, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss';
import {ZincElement} from "../zinc-element";

@customElement('zn-inline-edit')
export class InlineEdit extends ZincElement
{
  static styles = unsafeCSS(styles);

  @property({attribute: 'caption', type: String, reflect: true}) caption: string = ""; // Caption
  @property({attribute: 'description', type: String, reflect: true}) description: string = ""; // Description

  protected render()
  {
    return html`
      <div class="ai">
        <div class="ai__left">
          <span class="ai__caption">${this.caption}</span>
          <span class="ai__description">${this.description}</span>
        </div>
        <div class="ai__right">
          Edit
        </div>
      </div>
    `;
  }
}


