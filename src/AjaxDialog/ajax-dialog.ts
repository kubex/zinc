import { html, LitElement, unsafeCSS } from "lit";
import { customElement, property, query } from 'lit/decorators.js';
import { Pagelets } from '@packaged-ui/pagelets';

import styles from './index.scss';

@customElement('zn-ajax-dialog')
export class AjaxDialog extends LitElement
{
  static styles = unsafeCSS(styles);

  @property({ type: String, reflect: true }) url: string;

  @query('dialog', true)
  private _dialog: HTMLDialogElement;

  @query('#content')
  private _content: HTMLElement;

  async _openDialog(e)
  {
    e.preventDefault();

    const request = new Pagelets.Request({ url: this.url, targetElement: this._content });
    const load = await Pagelets.load(request);

    const actions = load.response.actions;
    const content = [];
    actions.forEach((action) =>
    {
      if(action.action === 'set-page')
      {
        content.push(action.data);
      }
    });

    this._content.innerHTML = content.join('');

    const closers = this._content.querySelectorAll('[dialog-closer]');
    closers.forEach((closer) =>
    {
      closer.addEventListener('click', this._closeDialog.bind(this));
    });

    this._dialog.showModal();
  }

  _closeDialog(e)
  {
    e.preventDefault();

    const closers = this._content.querySelectorAll('[dialog-closer]');
    closers.forEach((closer) =>
    {
      closer.removeEventListener('click', this._closeDialog.bind(this));
    });

    this._content.innerHTML = '';
    this._dialog.close();
  }

  render()
  {
    return html`
      <slot @click="${this._openDialog}"></slot>
      <dialog>
        <zn-button color="transparent" @click="${this._closeDialog}" icon="close" class="dialog-closer"></zn-button>
        <div id="content"></div>
      </dialog>
    `;
  }
}
