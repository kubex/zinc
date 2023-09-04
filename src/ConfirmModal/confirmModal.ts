import {CSSResultGroup, html, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss';
import {Dialog} from "../Dialog";

@customElement('zn-confirm')
export class ConfirmModal extends Dialog
{
  static get styles(): CSSResultGroup
  {
    return [super.styles, unsafeCSS(styles)];
  }

  @property({type: String, reflect: true}) title: string = '';
  @property({type: String, reflect: true}) content: string = '';
  @property({type: String, reflect: true}) action: string = '';
  @property({type: String, reflect: true}) method: string = 'post';
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

    const buttonGroup = html`
      <div class="button-group">
        <button type="button" class="button--secondary" @click="${this.closeDialog}">${this.cancelText}
        </button>
        <button @click="${this.submitDialog}"> ${this.confirmText}</button>
      </div>
    `;

    return html`
      <dialog class="type-${this.type}">
        <!-- default dialog close button -->
        ${icon}
        <h2 class="title">${this.title}</h2>
        <p>${this.content}</p>
        <slot></slot>
        ${buttonGroup}
      </dialog>`;
  }

  submitDialog()
  {
    // get the form from the slot
    const form = this.querySelector('form');
    if (form)
    {
      form.submit();
    }
  }
}


