import {html, LitElement, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss';

@customElement('zn-text-input')
export class TextInput extends LitElement {
  @property({attribute: 'id', type: String, reflect: true}) id;
  @property({attribute: 'name', type: String, reflect: true}) name;
  @property({attribute: 'prefix', type: String, reflect: true}) prefix;
  @property({attribute: 'placeholder', type: String, reflect: true}) placeholder;
  @property({attribute: 'value', type: String, reflect: true}) value;
  @property({attribute: 'type', type: String, reflect: true}) type = 'text';

  static styles = unsafeCSS(styles);

  render() {
    return html`
      ${this.prefix ? html`<span>${this.prefix}</span>` : ''}
      <input id="${this.id}"
             name="${this.name}"
             type="text"
             placeholder="${this.placeholder}"
             value="${this.value}"/>
      <slot></slot>`
  }
}