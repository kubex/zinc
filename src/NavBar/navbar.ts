import {html, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ZincElement} from "@/zinc-element";
import "../Popup";

import styles from './index.scss?inline';
import {PropertyValues} from "@lit/reactive-element";

@customElement('zn-navbar')
export class NavBar extends ZincElement
{
  static styles = unsafeCSS(styles);

  @property({attribute: 'navigation', type: Array}) navigation = [];
  @property({attribute: 'full-width', type: Boolean, reflect: true}) fullWidth: boolean;
  @property({attribute: 'icon-bar', type: Boolean, reflect: true}) iconBar: boolean;
  @property({attribute: 'hide-one', type: Boolean, reflect: true}) hideOne: boolean;
  @property({type: Boolean}) stacked: boolean;
  @property({type: Array}) dropdown = [];

  private _preItems: NodeListOf<Element>;
  private _postItems: NodeListOf<Element>;

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

  private handlePosition(e)
  {
    const target = e.target;
    const button = this.shadowRoot.querySelector('button[popovertarget="dropdown"]');
    const rect = button.getBoundingClientRect();
    target.style.left = `${rect.left}px`;
    target.style.top = `${rect.bottom}px`;
  }

  protected firstUpdated(_changedProperties: PropertyValues)
  {
    super.firstUpdated(_changedProperties);
    if(this.dropdown.length > 0)
    {
      const element = this.shadowRoot.querySelector('[popover]');
      element.addEventListener('toggle', this.handlePosition.bind(this));
    }
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

    let dropdown = html``;
    if(this.dropdown.length > 0)
    {
      dropdown = html`
        <button popovertarget="dropdown">+</button>
        <zn-menu popover id="dropdown" actions="${JSON.stringify(this.dropdown)}"></zn-menu>
      `;

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
        <li>${dropdown}</li>
        ${this._postItems}
      </ul>`;
  }
}
