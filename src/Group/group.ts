import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss';

export type InputType = 'text' | 'number';

@customElement('zn-group')
export class Group extends LitElement {
  @property({attribute: 'columns', type: String, reflect: true}) columns: string;

  static styles = unsafeCSS(styles);

  protected render(): unknown {
    return html`
      <slot></slot>
    `
  }
}


