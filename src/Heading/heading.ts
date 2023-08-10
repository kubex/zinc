import {html, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ZincElement} from "../zinc";

import styles from './index.scss';

@customElement('zn-heading')
export class Heading extends ZincElement {
  @property({attribute: 'transparent', type: Boolean, reflect: true}) transparent: boolean = false;
  @property({attribute: 'caption', type: String, reflect: true}) caption: String = "";
  @property({attribute: 'navigation', type: Array}) navigation = [];
  @property({attribute: 'breadcrumb', type: Array}) breadcrumb = [];
  @property({attribute: 'max-width', type: Number, reflect: true}) maxWidth;

  static styles = unsafeCSS(styles);

  clickNav(e) {
    e.target.closest('ul').querySelectorAll('li').forEach((item) => {
      item.classList.remove('active');
    });
    e.target.closest('li').classList.add('active');
  }

  render() {
    const header = html`
      <div>
        <div class="width-container">
          <div class="breadcrumb">${this.breadcrumb.map((item, index) => {
            const prefix = index == 0 ? '' : ' / ';
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
              const activeClass = item.active ? 'active' : '';
              return html`
                <li class="${activeClass}"><a @click="${this.clickNav}" href="${item.path}">${item.title}</a>
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
