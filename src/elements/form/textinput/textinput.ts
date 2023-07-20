import {html, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ZincElement} from "../../../ts/element";

import styles from './textinput.scss';

@customElement('zn-text-input')
export class ZincTextInput extends ZincElement {

  @property({attribute: 'id', type: String, reflect: true}) id;
  @property({attribute: 'name', type: String, reflect: true}) name;
  @property({attribute: 'prefix', type: String, reflect: true}) prefix;
  @property({attribute: 'placeholder', type: String, reflect: true}) placeholder;
  @property({attribute: 'value', type: String, reflect: true}) value;
  @property({attribute: 'type', type: String, reflect: true}) type = 'text';

  static get styles() {
    return [unsafeCSS(styles)];
  }

  render() {


    return html`
      <span>${this.prefix}</span>
      <input id="${this.id}"
             name="${this.name}"
             placeholder="${this.placeholder}"
             value="${this.value}"/>
      <slot></slot>`
  }
}
