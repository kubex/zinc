import { html, LitElement, unsafeCSS } from "lit";
import { customElement, property } from 'lit/decorators.js';

import styles from './index.scss';

@customElement('zn-alert')
export class Alert extends LitElement {

  static styles = unsafeCSS(styles);
  @property({ type: String }) icon: string = '';

  render() {
    const icon = this.icon ? html`
      <zn-icon library="mio" src="${this.icon}" id="xy2"></zn-icon>` : '';


    return html`
      ${icon}
      <div class="content">
        <slot name="content"></slot>
      </div>
      <div class="actions">
        <slot name="actions"></slot>
      </div>`;
  }
}


