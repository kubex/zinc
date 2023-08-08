import {html, LitElement, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss';

@customElement('zn-input')
export class Input extends LitElement {
  @property({attribute: 'for', type: String, reflect: true}) for;
  @property({attribute: 'label', type: String, reflect: true}) label;
  @property({attribute: 'class', type: String, reflect: true}) class;
  @property({attribute: 'advice', type: String, reflect: true}) advice;
  @property({attribute: 'summary', type: String, reflect: true}) summary;

  static styles = unsafeCSS(styles);

  render() {
    return html`
      <div class="${this.class}">
        <label for="${this.for}">${this.label}</label>
        ${this.summary}
        <slot></slot>
        ${this.advice}
      </div>`
  }
}
