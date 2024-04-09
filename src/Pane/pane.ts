import { html, unsafeCSS } from "lit";
import { customElement, query } from 'lit/decorators.js';

import styles from './index.scss';
import { ZincElement } from "../zinc";

@customElement('zn-pane')
export class Pane extends ZincElement
{
  static styles = unsafeCSS(styles);

  @query('zn-header')
  private header: HTMLElement;

  render()
  {
    if(this.header)
    {
      this.classList.add("with-header");
    }

    return html`
      ${this.header}
      <div class="pane__content">
        <slot></slot>
      </div>`;
  }
}


