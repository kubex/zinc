import {html, unsafeCSS} from "lit";
import {property, customElement} from 'lit/decorators.js';

import styles from './index.scss';
import {ZincElement} from "../zinc-element";
import {Element} from "chart.js";

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

  createRenderRoot()
  {
    return this;
  }

  render()
  {
    if(this._header)
    {
      this.classList.add("with-header");
    }

    return html`
      ${this._header}
      <div class="pane__content">
        ${Object.entries(this.childNodes).map(([key, val]) =>
        {
          if(val == this._header)
          {
            return;
          }
          return html`${val}`;
        })}
      </div>`;
  }

}


