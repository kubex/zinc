import { ZincElement } from "../zinc";
import { html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import styles from './index.scss';

@customElement('zn-sidebar')
export class Sidebar extends ZincElement
{
  @property({ attribute: 'caption', type: String, reflect: true }) caption;
  @property({ attribute: 'open', type: Boolean, reflect: true }) open: boolean = false;

  static styles = unsafeCSS(styles);

  render()
  {
    return html`
      <div class="container">
        <div id="primary-content">
          <slot></slot>
        </div>
        <div id="sidebar">
          ${this._expander()}
          <div id="content">
            <slot name="side"></slot>
          </div>
        </div>
      </div>`;
  }

  _expander()
  {
    const smpCap = this.caption ?? "Close";
    return html`
      <div id="expander" @click="${(e: MouseEvent) => this.handleClick(e)}">
        <zn-icon src="arrow_downward" library="material"></zn-icon>
        <span class="close"> Close ${this.caption}</span>
        <span class="close-sm">${smpCap}</span>
        <span class="open"> Show ${this.caption}</span>
      </div>`;
  }

  handleClick(e)
  {
    this.open = !this.open;
    e.stopPropagation();
  }
}


