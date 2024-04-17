import { html, LitElement, unsafeCSS } from "lit";
import { customElement, property } from 'lit/decorators.js';

import styles from './index.scss';

@customElement('zn-chip')
export class Chip extends LitElement
{
  static styles = unsafeCSS(styles);

  @property({ type: String }) icon: string = '';

  render()
  {
    return html`
      ${this.icon ? html`
        <zn-icon library="material-outlined" src="${this.icon}" size="18"></zn-icon>` : ''}
      <slot></slot>`;
  }
}


