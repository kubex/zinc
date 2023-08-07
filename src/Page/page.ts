import {ZincElement} from "../zinc";
import {html, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss';

@customElement('zn-page')
export class Page extends ZincElement {
  @property({attribute: 'caption', type: String, reflect: true}) caption;
  @property({attribute: 'open', type: Boolean, reflect: true}) open: boolean = false;

  static styles = unsafeCSS(styles);

  render() {
    let pageSide = null;
    let navigation = null;
    let mainClass = "";

    if (this.querySelectorAll('[slot="side"]').length > 0) {
      mainClass = "with-side";
      pageSide = html`
        <div class="pageside">
          ${this._expander()}
          <div class="content">
            <slot name="side"></slot>
          </div>
        </div>`;
    }

    if (this.querySelectorAll('[slot="nav"]').length > 0) {
      mainClass = "with-nav";
      pageSide = html`
        <div class="pageside">
          ${this._expander()}
          <div class="content">
            <slot name="nav"></slot>
          </div>
        </div>`;
    }

    return html`
      <div class="${mainClass}">
        ${navigation}
        <div id="page-content">
          <slot></slot>
        </div>
        ${pageSide}
      </div>`
  }

  _expander() {
    const smpCap = this.caption ?? "Close"
    return html`
      <div class="expander" @click="${(e: MouseEvent) => this.handleClick(e)}">
        <zn-icon src="arrow_downward" library="material"></zn-icon>
        <span class="close"> Close </span>
        <span class="close-sm">${smpCap}</span>
        <span class="open"> Show ${this.caption}</span>
      </div>`;
  }

  handleClick(e) {
    this.open = !this.open;
    e.stopPropagation();
  }
}


