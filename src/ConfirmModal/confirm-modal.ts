import {CSSResultGroup, html, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';
import {Dialog} from "../Dialog";
import {unsafeHTML} from "lit/directives/unsafe-html.js";

import styles from './index.scss?inline';

@customElement('zn-confirm')
export class ConfirmModal extends Dialog
{
  static get styles(): CSSResultGroup
  {
    return [super.styles, unsafeCSS(styles)];
  }

  @property({type: String, reflect: true}) caption: string = '';
  @property({type: String, reflect: true}) content: string = '';
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
      <zn-icon slot="primary" src=${src[this.type]} size="24"></zn-icon>
    `;
  }

  connectedCallback()
  {
    this.emit('zn-element-added', {detail: {element: this}});
    super.connectedCallback();
  }

  render()
  {
    const icon = this.getIcon();

    return html`
      <dialog class="type-${this.type}">
        <div id="content"> <!-- default dialog close button -->
          ${icon}
          <h2 class="title">${unsafeHTML(this.caption)}</h2>
          <p>${unsafeHTML(this.content)}</p>
          <slot></slot>
          <div class="button-group">
            <button type="button" class="button--secondary" dialog-closer>${this.cancelText}</button>
            <button @click="${this.submitDialog}"> ${this.confirmText}</button>
          </div>
        </div>
        <div class="done">
          <zn-icon src="check:success" size="150"></zn-icon>
        </div>
      </dialog>`;
  }

  submitDialog()
  {
    // get the form from the slot
    const form = this.querySelector('form');
    if(form && form.reportValidity())
    {
      form.requestSubmit();
      this.close();
    }
  }
}
