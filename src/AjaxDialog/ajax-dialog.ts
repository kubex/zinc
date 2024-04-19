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
    this._dialog.showModal();
  }

  _closeDialog(e)
  {
    e.preventDefault();

    this._content.innerHTML = '';
    this._dialog.close();
  }

  render()
  {
    return html`
      <zn-button @click="${this._openDialog}">Open Dialog</zn-button>
      <dialog>
        <zn-button color="transparent" @click="${this._closeDialog}" icon="close" class="dialog-closer"></zn-button>
        <div id="content"></div>
      </dialog>
    `;
  }
}
