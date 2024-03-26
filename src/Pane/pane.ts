import { html, unsafeCSS } from "lit";
import { customElement } from 'lit/decorators.js';

import styles from './index.scss';
import { ZincElement } from "../zinc";

@customElement('zn-pane')
export class Pane extends ZincElement
{
  static styles = unsafeCSS(styles);

  render()
  {
    let header = null;
    let mainClass = "";

    if(this.querySelectorAll('[slot="header"]').length > 0)
    {
      mainClass = "with-header";
      header = html`
        <div class="pane__header">
          <slot name="header"></slot>
        </div>`;
    }

    return html`
      <div class="pane ${mainClass}">
        ${header}
        <div class="pane__content">
          <slot></slot>
        </div>
      </div>`;
  }
}


