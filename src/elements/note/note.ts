import {html, unsafeCSS} from 'lit';
import {customElement} from 'lit/decorators.js';
import {ZincElement} from "../../ts/element";

import styles from './note.scss';

@customElement('zn-note')
export class ZincTile extends ZincElement {
  static get styles() {
    return [unsafeCSS(styles)];
  }

  render() {
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
