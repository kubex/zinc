import {html, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ZincElement} from "../../ts/element";

import styles from './textinput.scss';

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
      <div class="relative flex items-start my-md">
        <div class="flex h-[15px] items-center">
          <input type="checkbox" name="${this.name}" id="${this.name}">
        </div>
        <div class="ml-sm text-sm leading-6">
          <label for="${this.name}" class="text-dark-900 !m-0">${this.title}</label>
          <p class="text-dark-500">${this.description}</p>
        </div>
      </div>`
  }
}
