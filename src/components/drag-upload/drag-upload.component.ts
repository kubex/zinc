import {property} from 'lit/decorators.js';
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import ZincElement from '../../internal/zinc-element';

import styles from './drag-upload.scss';
import ZnButton from "../button";

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/drag-upload
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-example
 *
 * @event zn-event-name - Emitted as an example.
 *
 * @slot - The default slot.
 * @slot example - An example slot.
 *
 * @csspart base - The component's base wrapper.
 *
 * @cssproperty --example - An example CSS custom property.
 */
export default class ZnDragUpload extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({reflect: true}) text: string;
  @property({reflect: true}) types: string;
  @property({reflect: true}) size: string;

  private internals: ElementInternals;
  private value: string;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  _updateInternals() {
    this.internals.setFormValue(this.value);
    this.internals.setValidity({});
  }

  static get formAssociated() {
    return true;
  }

  getHumanTypes() {
    return this.types.split(',').map((type) => {
      return type.replace('image/', '').toUpperCase();
    }).join(', ');
  }

  render() {
    return html`
      <div id="drag-upload">
        <div id="info">
          <p>${this.text}</p>
          <p>(${this.getHumanTypes()}) up to (${this.size}MB)</p>
        </div>
        <input type="file" id="fileUpload" accept="${this.types}" size="${this.size}"
               @change="${this.handleUpload}">
        <label for="fileUpload">Upload</label>
      </div>`;
  }

  handleUpload(e: any) {
    const file = e.target.files[0];
    this.value = file;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = e.target.result;
      this.dispatchEvent(new CustomEvent('file-uploaded', {detail: {file, data}}));
    };
    reader.readAsDataURL(file);

    // Edit the #drag-upload #info text to show the file name
    const info: any = this.shadowRoot?.getElementById('info');
    info.innerHTML = `<p>${file.name}</p>`;
    info.classList.add('flex');
    info.style.gap = '1rem';
    info.style.alignItems = 'center';

    // add a cancel button
    const cancel: ZnButton = document.createElement('zn-button');
    cancel.setAttribute('icon', 'close');
    cancel.setAttribute('color', 'transparent');
    cancel.addEventListener('click', () => {
      info.innerHTML = '';
      info.classList.remove('flex');
      info.style.gap = '';
      info.style.alignItems = '';
      info.innerHTML = `<p>${this.text}</p><p>(${this.getHumanTypes()}) up to (${this.size}MB)</p>`;

      const input = this.shadowRoot?.getElementById('fileUpload') as HTMLInputElement;
      input.value = '';

      // show the upload button
      const upload = this.shadowRoot?.querySelector("label[for='fileUpload']") as HTMLElement;
      upload.style.display = 'block';

      // remove the submit button
      const submit = this.shadowRoot?.querySelector('zn-button[type="submit"]') as HTMLElement;
      if (submit) {
        submit.remove();
      }
    });

    info.appendChild(cancel);

    // hide the upload button
    const upload = this.shadowRoot?.querySelector("label[for='fileUpload']") as HTMLElement;
    upload.style.display = 'none';

    // add submit button
    const submit = document.createElement('zn-button');
    submit.setAttribute('icon', 'upload');
    submit.setAttribute('color', 'primary');
    submit.setAttribute('size', 'small');
    submit.setAttribute('type', 'submit');

    submit.addEventListener('click', () => {
      const form = this.closest('form');
      if (form) {
        form.requestSubmit();
      }
    });

    upload.insertAdjacentElement('afterend', submit);
  }
}
