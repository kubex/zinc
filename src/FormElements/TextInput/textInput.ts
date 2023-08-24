import {html, LitElement, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss';

@customElement('zn-text-input')
export class TextInput extends LitElement
{
  @property({type: String, reflect: true}) id: string;
  @property({type: String, reflect: true}) name: string;
  @property({type: String, reflect: true}) prefix: string;
  @property({type: String, reflect: true}) placeholder: string;
  @property({type: String, reflect: true}) value: string;
  @property({type: String, reflect: true}) type: string = 'text';

  static styles = unsafeCSS(styles);

  private internals: ElementInternals;

  static get formAssociated()
  {
    return true;
  }

  constructor()
  {
    super();
    this.internals = this.attachInternals();
    this.internals.setFormValue(this.value);
  }

  render()
  {
    return html`
      ${this.prefix ? html`<span>${this.prefix}</span>` : ''}
      <input id="${this.id}"
             name="${this.name}"
             type="text"
             placeholder="${this.placeholder}"
             value="${this.value}"
             @change="${this._handleChange}"/>
      <slot></slot>`;
  }

  _handleChange(e)
  {
    this.value = e.target.value;
    this.internals.setFormValue(this.value);
  }
}
