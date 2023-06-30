import {html, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ZincElement} from "../../../ts/element";

import styles from './checkbox.scss';

@customElement('zn-checkbox')
export class ZincCheckBox extends ZincElement {
  static get styles() {
    return [unsafeCSS(styles)];
  }

  @property({attribute: 'title', type: String, reflect: true})
  public title;
  @property({attribute: 'description', type: String, reflect: true})
  private description;
  @property({attribute: 'name', type: String, reflect: true})
  private name;

  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <div class="checkbox__wrapper">
        <div class="checkbox__input-wrapper">
          <input type="checkbox" name="${this.name}" id="${this.name}">
        </div>
        <div class="checkbox__label-wrapper">
          <label for="${this.name}">${this.title}
            <p>${this.description}</p>
          </label>
        </div>
      </div>`
  }
}
