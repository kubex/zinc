import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property, query} from 'lit/decorators.js';

import styles from './index.scss';
import {PropertyValues} from "@lit/reactive-element";

@customElement('zn-confirm')
export class ConfirmModal extends LitElement
{
  @query('dialog', true)
  private _dialog: HTMLDialogElement;

  static styles = unsafeCSS(styles);

  @property({type: String, reflect: true}) trigger: string = '';
  @property({type: String, reflect: true}) title: string = '';
  @property({type: String, reflect: true}) content: string = '';
  @property({type: String, reflect: true}) action: string = '';
  @property({type: String, reflect: true}) method: string = '';
  @property({type: String, reflect: true}) type: string = 'warning';
  @property({type: String, reflect: true}) confirmText: string = "Confirm";
  @property({type: String, reflect: true}) cancelText: string = "Cancel";


  getIcon()
  {
    const src = {
      'warning': 'priority_high',
      'error': 'priority_high',
      'success': 'check',
      'info': 'help'
    };


    return html`
      <zn-icon slot="primary" src=${src[this.type]} size="24" library="mio"></zn-icon>
    `;
  }

  render()
  {
    const icon = this.getIcon();
    return html`
      <dialog class="type-${this.type}">
        <!-- default dialog close button -->
        ${icon}
        <h2 class="title">${this.title}</h2>
        <form .action="${this.action}" .method="${this.method}">
          <p>${this.content}</p>
          <div class="button-group">
            <button type="button" class="button--secondary" @click="${this.closeDialog}">${this.cancelText}</button>
            <button type="submit">${this.confirmText}</button>
          </div>
        </form>
      </dialog>`;
  }

  connectedCallback()
  {
    super.connectedCallback();
    const trigger = document.querySelector('#' + this.trigger);
    if (trigger)
    {
      trigger.addEventListener('click', this.openDialog.bind(this));
    }
  }

  disconnectedCallback()
  {
    super.disconnectedCallback();
    const trigger = document.querySelector('#' + this.trigger);
    if (trigger)
    {
      trigger.removeEventListener('click', this.openDialog.bind(this));
    }
  }

  closeDialog()
  {
    this._dialog.close();
  }

  openDialog()
  {
    this._dialog.showModal();
  }
}


