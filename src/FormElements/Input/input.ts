import {html, LitElement, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss';

@customElement('zn-input')
export class Input extends LitElement
{
  @property({type: String, reflect: true}) for;
  @property({type: String, reflect: true}) label;
  @property({type: String, reflect: true}) class;
  @property({type: String, reflect: true}) advice;
  @property({type: String, reflect: true}) summary;
  @property({type: String, reflect: true}) prefix;
  @property({type: String, reflect: true}) suffix;

  static styles = unsafeCSS(styles);

  render()
  {
    return html`
      <label for="${this.for}">${this.label}</label>
      ${this.summary}
      <div class="wrap">
        ${this.prefix ? html`<span @click="${this._getFocus}" class="prefix">${this.prefix}</span>` : ''}
        <slot></slot>
        ${this.suffix ? html`<span @click="${this._getFocus}" class="suffix">${this.suffix}</span>` : ''}
      </div>
      <span class="advice">${this.advice}</span>
    `;
  }

  _getFocus()
  {
    this.querySelector('input').focus();
  }
}
