import {html, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ZincElement} from "../../zinc";

import styles from './index.scss';

@customElement('zn-form-group')
export class Group extends ZincElement {
  @property({attribute: 'caption', type: String, reflect: true}) caption;
  @property({attribute: 'description', type: String, reflect: true}) description;

  static get styles() {
    return [unsafeCSS(styles)];
  }

  render() {
    return html`
      <div>
        <h2 class="caption">${this.caption}</h2>
        <p class="description">${this.description}</p>
      </div>
      <div class="fg-inputs">
        <slot></slot>
      </div>`
  }
}
