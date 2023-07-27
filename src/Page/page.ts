import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss';

@customElement('zn-page')
export class Page extends LitElement {
  @property({attribute: 'caption', type: String, reflect: true}) caption;
  @property({attribute: 'open', type: Boolean, reflect: true}) open: boolean = false;

  static styles = unsafeCSS(styles);

  protected render(): unknown {
    let aside = html``;
    let mainClass = "";

    if (this.querySelectorAll('[slot="aside"]').length > 0) {
      mainClass = "with-side";
      aside = html`
        <div class="aside">
          ${this._expander()}
          <div class="content">
            <slot name="side"></slot>
          </div>
        </div>
      `
    }

    if (this.querySelectorAll('[slot="nav"]').length > 0) {
      mainClass = "with-nav";
      aside = html`
        <div class="pageside">
          ${this._expander()}
          <div class="content">
            <slot name="nav"></slot>
          </div>
        </div>
      `
    }

    return html`
      <div class="${mainClass}">
        <div id="page-content">
          <slot></slot>
        </div>
        ${aside}
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
      </div>;`
  }

  handleClick(e) {
    this.open = !this.open;
    e.stopPropagation();
  }
}


