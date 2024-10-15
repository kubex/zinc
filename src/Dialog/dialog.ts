import {CSSResultGroup, html, unsafeCSS} from "lit";
import {customElement, property, query} from 'lit/decorators.js';
import {ZincElement} from "@/zinc-element";

import styles from './index.scss?inline';

@customElement('zn-dialog')
export class Dialog extends ZincElement
{
  @property({type: String, reflect: true}) trigger: string;

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

    // Make sure the closer has a pointer cursor
    const closer = this.querySelector('[dialog-closer]') as HTMLElement;
    if(closer)
    {
      closer.style.cursor = 'pointer';
    }

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

  protected _closeDialog(e = null)
  {
    e?.stopPropagation();
    this._dialog.close();
    this.emit('zn-close', {detail: {element: this}});
  }

  open()
  {
    this.emit('zn-open', {detail: {element: this}});
    this._dialog.showModal();
  }

  close()
  {
    this._dialog.classList.remove('closing');
    this._closeDialog();
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
