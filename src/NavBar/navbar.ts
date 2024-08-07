import {html, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ZincElement} from "@/zinc-element";
import "../Popup";

import styles from './index.scss?inline';
import {PropertyValues} from "@lit/reactive-element";
import {classMap} from "lit/directives/class-map.js";
import {ZincMenuSelectEvent} from "@/Events/zn-menu-select";

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
  private _openedTabs: string[] = [];

  connectedCallback()
  {
    super.connectedCallback();
    this._preItems = this.querySelectorAll('li:not([suffix])');
    this._postItems = this.querySelectorAll('li[suffix]');
  }

  public addItem(item)
  {
    if(this._openedTabs.includes(item.getAttribute('tab-uri')))
    {
      return;
    }
    this._openedTabs.push(item.getAttribute('tab-uri'));
    const ul = this.shadowRoot.querySelector('ul');
    const dropdown = this.shadowRoot.querySelector('li[id="dropdown-item"]');
    return dropdown ? ul.insertBefore(item, dropdown) : ul.appendChild(item);
  }

  public removeItem(name: string)
  {
    const item = this.shadowRoot.querySelector(`li[tab-uri="${name}"]`);
    if(item)
    {
      item.remove();
    }
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

      const menu = this.shadowRoot.querySelector('zn-menu');
      if(menu)
      {
        menu.addEventListener('zn-menu-select', (e: ZincMenuSelectEvent) =>
        {
          const element = e.detail.element;
          if(element.hasAttribute('data-path'))
          {
            const li = document.createElement('li');
            li.setAttribute('tab-uri', (e.detail.element as HTMLElement).getAttribute('data-path'));
            li.innerText = (e.detail.element as HTMLElement).innerText;
            this.addItem(li);
            li.click();
          }
        });
      }
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

    let dropdown = null;
    if(this.dropdown && this.dropdown.length > 0)
    {
      dropdown = html`
        <button popovertarget="dropdown">
          <zn-icon src="add" size="18"></zn-icon>
        </button>
        <zn-menu popover id="dropdown" actions="${JSON.stringify(this.dropdown)}"></zn-menu>
      `;
    }

    return html`
      <ul>
        ${this._preItems}
        ${this.navigation.map((item) =>
        {
          let content = html`${item.title}`;
          if(item.icon != undefined && item.icon != '')
          {
            content = html`
              <zn-icon src="${item.icon}"></zn-icon>${content}`;
          }
          if(item.path != undefined)
          {
            return html`
              <li class="${classMap({'active': item.active})}" tab-uri="${item.path}">${content}</li>`;
          }
          return html`
            <li class="${classMap({'active': item.active})}" tab="">${content}</li>`;
        })}
        ${dropdown ? html`
          <li id="dropdown-item">
            <div class="dropdown-wrap">${dropdown}</div>
          </li>` : ''}
        ${this._postItems}
      </ul>`;
  }
}
