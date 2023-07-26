import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss';

export type InputType = 'text' | 'number';

@customElement('zn-input')
export class Input extends LitElement {
  @property({attribute: 'label', type: String, reflect: true}) label: string;
  @property({attribute: 'value', type: String, reflect: true}) value: string | undefined;
  @property({attribute: 'name', type: String, reflect: true}) name: string | undefined;
  @property({attribute: 'placeholder', type: String, reflect: true}) placeholder: string | undefined;

  @property({attribute: 'type', type: String, reflect: true}) type: InputType = 'text';
  @property({attribute: 'error', type: String, reflect: true}) error: string;


  static styles = unsafeCSS(styles);

  protected render(): unknown {
    let input = undefined;

    if (this.placeholder === undefined) {
      this.placeholder = this.name;
    }

    if (this.type === 'text') {
      input = html`<input type="text" name=${this.name} placeholder=${this.placeholder} value=${this.value}/>`
    }

    return html`<label for="${this.name}">${this.label}</label>
    ${input}
    ${this.error ? html`
      <div class="error">${this.error}</div>` : ''}
    `
  }
}


