import {html, unsafeCSS} from "lit";
import {customElement} from 'lit/decorators.js';

import styles from './index.scss';
import {ZincElement} from "../zinc";

@customElement('zn-pane')
export class Pane extends ZincElement
{
  static styles = unsafeCSS(styles);

  render()
  {
    let mainClass = "";
    const header = this.querySelector('zn-header');

    if(header)
    {
      mainClass = "with-header";
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


