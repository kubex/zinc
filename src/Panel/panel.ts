import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss';

@customElement('zn-panel')
export class Panel extends LitElement {
  @property({attribute: 'caption', type: String, reflect: true}) caption;
  @property({attribute: 'small', type: Boolean, reflect: true}) small;
  @property({attribute: 'stat', type: Boolean, reflect: true}) stat;
  @property({attribute: 'rows', type: Number, reflect: true}) rows;
  @property({attribute: 'navigation', type: Array}) navigation = [];

  static styles = unsafeCSS(styles);

  protected render(): unknown {
    const footerItems = this.querySelectorAll('[slot="footer"]').length > 0;
    const actionItems = this.querySelectorAll('[slot="actions"]').length > 0;

    let nav = html``;
    if (this.navigation.length > 0) {
      nav = html`
        <div class="nav">
          <ul>
            ${this.navigation.map((item, index) => html`
              <li><a href="${item.path}">${item.title}</a></li>`)}
          </ul>
        </div>`;
    }

    if (this.rows > 0) {
      this.style.setProperty('--row-count', this.rows);
    }

    let header;
    if (actionItems || this.caption || this.navigation.length > 0) {
      header = html`
        <div class="header">
          <span>${this.caption}</span>
          <slot name="actions"></slot>
        </div>
        ${nav}
      `
    }

    let footer;
    if (footerItems) {
      footer = html`
        <div class="footer">
          <slot name="footer"></slot>
        </div>`
    }

    return html`
      <div>${header}
        <div class="body">
          <slot></slot>
        </div>
        ${footer}
      </div>`
  }
}

