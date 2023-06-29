import {html, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ZincElement} from "../../../ts/element";

import styles from '../scss/TextInput.scss';

@customElement('zn-text-input')
export class ZincTextInput extends ZincElement {
  static get styles() {
    return [unsafeCSS(styles)];
  }

  @property({attribute: 'id', type: String, reflect: true})
  public id;
  @property({attribute: 'name', type: String, reflect: true})
  private name;
  @property({attribute: 'prefix', type: String, reflect: true})
  public prefix;
  @property({attribute: 'placeholder', type: String, reflect: true})
  private placeholder;
  @property({attribute: 'value', type: String, reflect: true})
  private value;
  @property({attribute: 'type', type: String, reflect: true})
  private type = 'text';

  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <div class="flex">
        <span class="flex select-none items-center">${this.prefix}</span>
        <input class="flex-1"
               id="${this.id}"
               name="${this.name}"
               placeholder="${this.placeholder}"
               value="${this.value}"/>
      </div>`
  }
}
