import {html, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ZincElement} from "../../ts/element";

import styles from './page.scss';

@customElement('zn-page')
export class ZincPage extends ZincElement {
  static get styles() {
    return [unsafeCSS(styles)];
  }

  @property({attribute: 'caption', type: String, reflect: true})
  private caption;

  @property({attribute: 'open', type: Boolean, reflect: true})
  private open: boolean = false;

  _handleClick(e) {
    this.open = !this.open;
  }

  connectedCallback() {
    super.connectedCallback();
  }

  render() {
    let pageSide = null;
    let navigation = null;
    let mainClass = "";
    if (this.querySelectorAll('[slot="side"]').length > 0) {
      mainClass = "with-side";
      let smpCap = this.caption ?? "Close"
      pageSide = html`
        <div class="pageside">
          <div class="expander" @click="${this._handleClick}">
            <zn-icon src="arrow_downward" library="material"></zn-icon>
            <span class="close">Close</span>
            <span class="close-sm">${smpCap}</span>
            <span class="open">Show ${this.caption}</span>
          </div>
          <div class="content">
            <slot name="side"></slot>
          </div>
        </div>`;
    }
    if (this.querySelectorAll('[slot="nav"]').length > 0) {
      mainClass = "with-nav";
      let smpCap = this.caption ?? "Close"
      pageSide = html`
        <div class="pageside">
          <div class="expander" @click="${this._handleClick}">
            <zn-icon src="arrow_downward" library="material"></zn-icon>
            <span class="close">Close</span>
            <span class="close-sm">${smpCap}</span>
            <span class="open">Show ${this.caption}</span>
          </div>
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
}
