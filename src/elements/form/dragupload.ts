import {html, unsafeCSS} from 'lit';
import {customElement, property} from "lit/decorators.js";
import {ZincElement} from "../../ts/element";

import styles from './dragupload.scss';

@customElement('zn-drag-upload')
export class ZincDragUpload extends ZincElement {

  @property({attribute: 'text', type: String, reflect: true})
  private text;
  @property({attribute: 'types', type: String, reflect: true})
  private types;
  @property({attribute: 'size', type: String, reflect: true})
  private size;


  static get styles() {
    return [unsafeCSS(styles)];
  }

  createRenderRoot() {
    return this;
  }

  getHumanTypes() {
    return this.types.split(',').map((type) => {
      return type.replace('image/', '').toUpperCase();
    }).join(', ');
  }

  render() {
    return html`
      <div id="drag-upload">
        <p>${this.text}</p>
        <p>(${this.getHumanTypes()}) up to (${this.size}MB)</p>
        <input type="file" id="fileUpload" accept="${this.types}" size="${this.size}"/>
        <label for="fileUpload">Upload</label>
      </div>`
  }
}
