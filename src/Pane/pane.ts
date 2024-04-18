import {html, unsafeCSS} from "lit";
import {property, customElement} from 'lit/decorators.js';

import styles from './index.scss';
import {ZincElement} from "../zinc";

@customElement('zn-pane')
export class Pane extends ZincElement
{
  static styles = unsafeCSS(styles);
  @property({attribute: 'without-tabs', type: Boolean}) _tabLess = false;
  protected _header: HTMLElement;

  connectedCallback()
  {
    super.connectedCallback();
    this._header = this.querySelector("zn-header");
  }

  render()
  {
    if(this._header)
    {
      this.classList.add("with-header");
    }

    if(this._tabLess)
    {
      return html`
        ${this._header}
        <div class="pane__content">
          <slot></slot>
        </div>`;
    }

    return html`
      <zn-tabs>
        ${this._header}
        <div class="pane__content">
          <zn-tab-panel>
            <slot></slot>
          </zn-tab-panel>
        </div>
      </zn-tabs>`;
  }
}


