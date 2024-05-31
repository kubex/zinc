import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss?inline';
import {classMap} from "lit/directives/class-map.js";

@customElement('zn-menu')
export class Menu extends LitElement
{
  @property({attribute: 'actions', type: Array}) actions = [];

  public closer;

  static styles = unsafeCSS(styles);

  _handleAction(e)
  {
    if(this.hasAttribute('popover'))
    {
      this.hidePopover();
    }
    if(this.closer)
    {
      this.closer();
    }
  }

  render()
  {
    let menu = html``;
    if(this.actions.length > 0)
    {
      menu = html`
        <ul>
          ${this.actions.map((item) =>
          {
            const liClass = item.style ? item.style : 'def';
            if(item.confirm)
            {
              return html`
                <zn-confirm trigger="${item.confirm.trigger}" caption="${item.confirm.caption}"
                            content="${item.confirm.content}" action="${item.confirm.action}"></zn-confirm>
                <li class="${liClass}"><span id="${item.confirm.trigger}">${item.title}</span></li>`;
            }
            else if(item.target && item.path)
            {
              return html`
                <li class="${liClass}"><a @click="${this._handleAction}" href="${item.path}"
                                          data-target="${item.target}">${item.title}</a></li>`;
            }
            else if(item.path)
            {
              return html`
                <li class="${liClass}"><a @click="${this._handleAction}" href="${item.path}">${item.title}</a></li>`;
            }
            return null;
          })}
        </ul>
      `;
    }

    return html`
      <div class="${classMap({'menu': true})}">${menu}</div>`;
  }
}
