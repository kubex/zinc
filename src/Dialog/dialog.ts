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
    this.addEventListener('click', this._closeClickHandler.bind(this));
    this.shadowRoot.addEventListener('click', this._closeClickHandler.bind(this));

    if(this.trigger)
    {
      const trigger = this.parentElement.querySelector('#' + this.trigger);
      if(trigger)
      {
        trigger.addEventListener('click', this._openDialog.bind(this));
      }
    }
  }

  disconnectedCallback()
  {
    super.disconnectedCallback();
    const trigger = document.querySelector('#' + this.trigger);
    if(trigger)
    {
      trigger.removeEventListener('click', this._openDialog.bind(this));
    }
  }

  protected _openDialog(e)
  {
    e.stopPropagation();
    this.open();
  }

  protected _closeDialog(e)
  {
    e.stopPropagation();
    this._dialog.close();
  }

  open()
  {
    this._dialog.showModal();
  }

  close()
  {
    this._dialog.close();
    this._dialog.classList.remove('closing');
  }

  successCloseDialog()
  {
    this._dialog.classList.add('closing');
    setTimeout(() =>
    {
      this.close();
    }, 1000);
  }

  private _closeClickHandler(e: Event)
  {
    if(e.target instanceof HTMLElement && e.target.hasAttribute('dialog-closer'))
    {
      this._closeDialog(e);
    }
  }

  render()
  {
    return html`
      <dialog>
        <div id="content">
          <slot></slot>
        </div>
        <div class="done">
          <zn-icon src="check:success" size="150"></zn-icon>
        </div>
      </dialog>
    `;
  }
}
