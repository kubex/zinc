import {html, LitElement, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
// @ts-ignore
import styles from '../scss/Styles.scss';
import {ZincElement} from "../../../ts/element";

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
              <h1>${this.caption}</h1>
              <slot></slot>
              <ul class="header-nav">
                ${this.navigation.map((item, index) => {
                  let activeClass = item.path == window.location.pathname || item.active ? 'active' : '';
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
