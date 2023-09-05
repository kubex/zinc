import {html, LitElement, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss';

@customElement('zn-drag-upload')
export class DragUpload extends LitElement {
  @property({attribute: 'text', type: String, reflect: true}) text;
  @property({attribute: 'types', type: String, reflect: true}) types;
  @property({attribute: 'size', type: String, reflect: true}) size;

  static styles = unsafeCSS(styles);

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
