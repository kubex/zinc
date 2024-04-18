import {html, unsafeCSS} from "lit";
import {customElement} from 'lit/decorators.js';

import styles from './index.scss';
import {ZincElement} from "../zinc";

@customElement('zn-pane')
export class Pane extends ZincElement
{
  static styles = unsafeCSS(styles);

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
      console.log(this._header.offsetHeight, this._header.clientHeight, this._header.scrollHeight, this._header.getBoundingClientRect());
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


