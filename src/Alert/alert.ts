import { html, LitElement, unsafeCSS } from "lit";
import { customElement, property } from 'lit/decorators.js';

import styles from './index.scss';

@customElement('zn-alert')
export class Alert extends LitElement {

  static styles = unsafeCSS(styles);
  @property({ type: String }) icon: string = '';

  @property({ type: Boolean }) collapse: boolean = false;

  render() {
    let icon;

    if (this.icon) {
      if (this.collapse) {
        icon = this.icon ? html`
          <zn-icon src="${this.icon}" id="xy2" @click="${this.hideAlert}"
                   style="cursor: pointer"></zn-icon>` : "";
      } else {
        icon = this.icon ? html`
          <zn-icon  src="${this.icon}" id="xy2"></zn-icon>` : '';
      }
    }

    return html`
      ${icon}
      <div class="content">
        <slot name="content"></slot>
      </div>
      <div class="actions">
        <slot name="actions"></slot>
      </div>`;
  }

  public hideAlert() {
    this.style.display = "none";
  }
}


