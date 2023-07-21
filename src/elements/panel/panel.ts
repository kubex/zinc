import {html, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ZincElement} from "../../ts/element";

import styles from './panel.scss';

@customElement('zn-panel')
export class ZincPanel extends ZincElement {
  static get styles() {
    return [unsafeCSS(styles)];
  }

  @property({attribute: 'caption', type: String, reflect: true})
  private caption;

  @property({attribute: 'small', type: Boolean, reflect: true})
  private small;

  @property({attribute: 'stat', type: Boolean, reflect: true})
  private stat;

  @property({attribute: 'rows', type: Number, reflect: true})
  private rows;

  @property({attribute: 'navigation', type: Array})
  private navigation = [];

  render() {
    const footerItems = this.querySelectorAll('[slot="footer"]').length > 0;
    const actionItems = this.querySelectorAll('[slot="actions"]').length > 0;

    let nav = html``;
    if (this.navigation.length > 0) {
      nav = html`<div class="nav">
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
