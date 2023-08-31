import {CSSResultGroup, html, LitElement, unsafeCSS} from "lit";
import {customElement, property, query} from 'lit/decorators.js';

import styles from './index.scss';

@customElement('zn-dialog')
export class Dialog extends LitElement
{
  @property({type: String, reflect: true}) trigger: string = '';

  @query('dialog', true)
  private _dialog: HTMLDialogElement;

  static get styles(): CSSResultGroup
  {
    return unsafeCSS(styles);
  }

  connectedCallback()
  {
    super.connectedCallback();
    this.addEventListener('click', this._closeClickCheck.bind(this));
    this.shadowRoot.addEventListener('click', this._closeClickCheck.bind(this));

    const trigger = this.parentElement.querySelector('#' + this.trigger);
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

  _closeClickCheck(e: Event)
  {
    if (e.target instanceof HTMLElement && e.target.hasAttribute('dialog-closer'))
    {
      this.closeDialog();
    }
  }

  render()
  {
    return html`
      <dialog>
        <slot></slot>
      </dialog>
    `;
  }
}
