import {html, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ZincElement} from "../../../ts/element";

import styles from './input.scss';

@customElement('zn-input')
export class ZincInput extends ZincElement {
  static get styles() {
    return [unsafeCSS(styles)];
  }

  @property({attribute: 'for', type: String, reflect: true})
  private for;
  @property({attribute: 'label', type: String, reflect: true})
  private label;
  @property({attribute: 'class', type: String, reflect: true})
  private class;
  @property({attribute: 'advice', type: String, reflect: true})
  private advice;
  @property({attribute: 'summary', type: String, reflect: true})
  private summary;


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
