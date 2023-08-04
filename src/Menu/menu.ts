import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss';

@customElement('zn-menu')
export class Menu extends LitElement {
  @property({attribute: 'actions', type: Array}) actions = [];

  public closer;
  public slot = "menu";

  static styles = unsafeCSS(styles);

  _handleAction(e) {
    if (this.closer) {
      this.closer();
    }
  }

  render() {
    let header;
    if (this.actions.length > 0) {
      header = html`
        <ul>
          ${this.actions.map((item) => {
            if (item.target && item.path) {
              return html`
                <li><a @click="${this._handleAction}" href="${item.path}"
                       data-target="${item.target}">${item.title}</a></li>`
            } else if (item.path) {
              return html`
                <li><a @click="${this._handleAction}" href="${item.path}">${item.title}</a></li>`
            }
            return null;
          })}
        </ul>
      `
    }

    return html`
      <div>${header}</div>`
  }
}


