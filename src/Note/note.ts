import {html, LitElement, unsafeCSS} from "lit";
import {customElement} from 'lit/decorators.js';

import styles from './index.scss';

@customElement('zn-note')
export class Note extends LitElement {
  static styles = unsafeCSS(styles);

  protected render(): unknown {
    return html`
      <div>
        <div class="header">
          <slot class="caption" name="caption"></slot>
          <slot class="date" name="date"></slot>
        </div>
        <div class="body">
          <slot></slot>
        </div>
      </div>
    `
  }
}


