import {html, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ZincElement} from "../../ts/element";

import styles from './header.scss';

@customElement('zn-header')
export class ZincHeader extends ZincElement {
  static get styles() {
    return [unsafeCSS(styles)];
  }

  @property({attribute: 'transparent', type: Boolean, reflect: true})
  private transparent: boolean = false;

  @property({attribute: 'caption', type: String, reflect: true})
  private caption: String = "";

  @property({attribute: 'navigation', type: Array})
  private navigation = [];

  @property({attribute: 'breadcrumb', type: Array})
  private breadcrumb = [];

  @property({attribute: 'max-width', type: Number, reflect: true})
  private maxWidth;

  _clickNav(e) {
    e.target.closest('ul').querySelectorAll('li').forEach((item) => {
      item.classList.remove('active');
    });
    e.target.closest('li').classList.add('active');
  }

  render() {
    let header = html`
      <div>
        <div class="width-container">
          <div class="breadcrumb">${this.breadcrumb.map((item, index) => {
            let prefix = index == 0 ? '' : ' / ';
            if (item.path == '') {
              return html`
                ${prefix} <span>${item.title}</span>`;
            }
            return html`
              ${prefix} <a href="${item.path}">${item.title}</a>`;
          })}
          </div>
          <h1>${this.caption}</h1>
          <div class="actions">
            <slot></slot>
          </div>
          <ul class="header-nav">
            ${this.navigation.map((item, index) => {
              let activeClass = item.active ? 'active' : '';
              return html`
                <li class="${activeClass}"><a @click="${this._clickNav}" href="${item.path}">${item.title}</a>
                </li>`;
            })}
          </ul>
        </div>
      </div>
    `
    if (this.maxWidth > 0) {
      return html`
        <style>:host {
          --max-width: ${this.maxWidth}px; </style>${header}`
    }

    return header
  }
}
