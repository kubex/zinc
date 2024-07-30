import {html, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ZincElement} from "../zinc-element";


import styles from './index.scss?inline';

@customElement('zn-navbar')
export class NavBar extends ZincElement
{

  private _preItems: NodeListOf<Element>;
  private _postItems: NodeListOf<Element>;
  @property({attribute: 'navigation', type: Array}) navigation = [];
  @property({attribute: 'full-width', type: Boolean, reflect: true}) fullWidth: boolean;
  @property({attribute: 'icon-bar', type: Boolean, reflect: true}) iconBar: boolean;
  @property({attribute: 'hide-one', type: Boolean, reflect: true}) hideOne: boolean;
  @property({type: Boolean}) stacked: boolean;

  static styles = unsafeCSS(styles);

  connectedCallback()
  {
    super.connectedCallback();
    this._preItems = this.querySelectorAll('li:not([suffix])');
    this._postItems = this.querySelectorAll('li[suffix]');
  }

  public addItem(item)
  {
    return this.shadowRoot.querySelector('ul').appendChild(item);
  }

  render()
  {
    if(!this.navigation)
    {
      this.navigation = [];
    }
    const itemCount = this.navigation?.length + this._preItems?.length + this._postItems?.length;
    if(itemCount < 2 && this.hideOne)
    {
      this.style.display = 'none';
    }

    return html`
      <ul>
        ${this._preItems}
        ${this.navigation.map((item, index) =>
        {
          const activeClass = item.active ? 'active' : '';

          let content = html`${item.title}`;
          if(item.icon != undefined && item.icon != '')
          {
            content = html`
              <zn-icon src="${item.icon}"></zn-icon>${content}`;
          }

          if(item.path != undefined)
          {
            return html`
              <li class="${activeClass}" tab-uri="${item.path}">${content}</li>`;
          }
          return html`
            <li class="${activeClass}" tab="">${content}</li>`;
        })}
        ${this._postItems}
      </ul>`;
  }
}
