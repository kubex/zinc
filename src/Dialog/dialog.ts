import {html, LitElement, unsafeCSS} from "lit";
import {customElement, query} from 'lit/decorators.js';

import styles from './index.scss';

@customElement('zn-dialog')
export class Dialog extends LitElement
{
  @query('dialog', true)
  private _dialog: HTMLDialogElement;
  static styles = unsafeCSS(styles);

  connectedCallback()
  {
    super.connectedCallback();
    this.addEventListener('click', this._closeClickCheck.bind(this));
    this.shadowRoot.addEventListener('click', this._closeClickCheck.bind(this));
  }

  _closeClickCheck(e: Event)
  {
    if (e.target instanceof HTMLElement && e.target.hasAttribute('dialog-closer'))
    {
      this._dialog.close();
    }
  }

  _showModal()
  {
    this._dialog.showModal();
  }

  render()
  {
    return html`
      <dialog id="launchd">
        <slot></slot>
      </dialog>
      <button @click="${this._showModal}">Launch Dialog</button>
    `;
  }
}
