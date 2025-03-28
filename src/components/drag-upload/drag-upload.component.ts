import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {FormControlController} from "../../internal/form";
import {property, query} from 'lit/decorators.js';
import ZincElement, {ZincFormControl} from '../../internal/zinc-element';

import styles from './drag-upload.scss';

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
export default class ZnDragUpload extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);

  private readonly formControlController = new FormControlController(this)

  @property({reflect: true}) caption: string;

  @property({reflect: true}) types: string = 'image/*,application/pdf';

  @property({reflect: true}) size: string = '10'; // MB

  @property() name: string = "";

  @property({reflect: true}) value: File | null;

  @query('#fileUpload') uploadInput: HTMLInputElement;

  /** Gets the validity state object */
  get validity() {
    return this.uploadInput.validity;
  }

  /** Gets the validation message */
  get validationMessage() {
    return this.uploadInput.validationMessage;
  }

  /** Checks the validity but does not show a validation message. Returns `true` when valid and `false` when invalid. */
  checkValidity(): boolean {
    return this.uploadInput.checkValidity();
  }

  /** Gets the associated form, if one exists. */
  getForm(): HTMLFormElement | null {
    return this.formControlController.getForm();
  }

  /** Checks for validity and shows the browser's validation message if the control is invalid. */
  reportValidity() {
    return this.uploadInput.reportValidity();
  }

  /** Sets a custom validation message. Pass an empty string to restore validity. */
  setCustomValidity(message: string) {
    this.uploadInput.setCustomValidity(message);
    this.formControlController.updateValidity();
  }

  getHumanTypes() {
    return this.types.split(',').join(', ');
  }

  render() {
    return html`
      <div id="drag-upload">
        <div id="info">
          <p>${this.caption}</p>
          <p>(${this.getHumanTypes()}) up to (${this.size}MB)</p>
          ${this.value ? html`<p>${this.value.name}</p>
          <zn-button icon="close" color="transparent" @click="${this.handleClearValue}"></zn-button>` : ''}
        </div>
        <input type="file" id="fileUpload" accept="${this.types}" size="${this.size}"
               @change="${this.handleUpload}">
        <label for="fileUpload">Upload</label>
        ${this.value ? html`
          <zn-button type="submit" icon="upload" color="default" size="small"></zn-button>` : ''}
      </div>`;
  }

  handleClearValue = (e: MouseEvent) => {
    this.value = null;
    e.preventDefault();
  }

  handleUpload = (e: Event & { target: HTMLInputElement }) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    this.value = file;

    const reader = new FileReader();
    reader.onload = (onloadEvent: ProgressEvent<FileReader>) => {
      const data = onloadEvent.target?.result;
      this.dispatchEvent(new CustomEvent('file-uploaded', {detail: {file, data}}));
    };
    reader.readAsDataURL(file);
  }
}
