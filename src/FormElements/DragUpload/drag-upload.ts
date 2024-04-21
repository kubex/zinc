import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import styles from './index.scss';

@customElement('zn-drag-upload')
export class DragUpload extends LitElement
{
  @property({ attribute: 'text', type: String, reflect: true }) text;
  @property({ attribute: 'types', type: String, reflect: true }) types;
  @property({ attribute: 'size', type: String, reflect: true }) size;

  static styles = unsafeCSS(styles);

  getHumanTypes()
  {
    return this.types.split(',').map((type) =>
    {
      return type.replace('image/', '').toUpperCase();
    }).join(', ');
  }

  render()
  {
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

  handleUpload(e)
  {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) =>
    {
      const data = e.target.result;
      this.dispatchEvent(new CustomEvent('file-uploaded', { detail: { file, data } }));
    };
    reader.readAsDataURL(file);

    // Edit the #drag-upload #info text to show the file name
    const info = this.shadowRoot.getElementById('info');
    info.innerHTML = `<p>${file.name}</p>`;
    info.classList.add('flex');
    info.style.gap = '1rem';
    info.style.alignItems = 'center';

    // add a cancel button
    const cancel = document.createElement('zn-button');
    cancel.setAttribute('icon', 'close');
    cancel.setAttribute('color', 'transparent');
    cancel.addEventListener('click', () =>
    {
      info.innerHTML = '';
      info.classList.remove('flex');
      info.style.gap = '';
      info.style.alignItems = '';
      info.innerHTML = `<p>${this.text}</p><p>(${this.getHumanTypes()}) up to (${this.size}MB)</p>`;

      const input = this.shadowRoot.getElementById('fileUpload') as HTMLInputElement;
      input.value = '';

      // show the upload button
      const upload = this.shadowRoot.querySelector("label[for='fileUpload']") as HTMLElement;
      upload.style.display = 'block';
    });

    info.appendChild(cancel);

    // hide the upload button
    const upload = this.shadowRoot.querySelector("label[for='fileUpload']") as HTMLElement;
    upload.style.display = 'none';
  }
}
