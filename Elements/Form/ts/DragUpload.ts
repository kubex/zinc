import {html, unsafeCSS} from 'lit';
import {customElement} from 'lit/decorators.js';
import {ZincElement} from "../../../ts/element";

import styles from '../scss/DragUpload.scss';

@customElement('zn-drag-upload')
export class ZincDragUpload extends ZincElement {
  static get styles() {
    return [unsafeCSS(styles)];
  }

  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <div>
        <span class="bg-warning px-lg py-lg">
          <slot></slot>
        </span>
      </div>`
  }
}
