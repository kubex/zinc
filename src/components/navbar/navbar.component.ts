import { property } from 'lit/decorators.js';
import { type CSSResultGroup, html, PropertyValues, unsafeCSS } from 'lit';
import ZincElement from '../../internal/zinc-element';

import styles from './navbar.scss';
import { classMap } from "lit/directives/class-map.js";
import { ZnMenuSelectEvent } from "../../events/zn-menu-select";

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/navbar
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-example
 *
 * @event zn-event-name - Emitted as an example.
 *
 * @slot - The default slot.
 * @slot example - An example slot.
 *
 * @csspart base - The component's base wrapper.
 *
 * @cssproperty --example - An example CSS custom property.
 */
export default class ZnNavbar extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({ attribute: 'navigation', type: Array }) navigation = [];
  @property({ attribute: 'full-width', type: Boolean, reflect: true }) fullWidth: boolean;
  @property({ attribute: 'icon-bar', type: Boolean, reflect: true }) iconBar: boolean;
  @property({ attribute: 'hide-one', type: Boolean, reflect: true }) hideOne: boolean;
  @property({ type: Boolean }) stacked: boolean;
  @property({ type: Array }) dropdown = [];

  private _preItems: NodeListOf<Element>;
  private _postItems: NodeListOf<Element>;
  private _openedTabs: string[] = [];

  connectedCallback() {
    super.connectedCallback();
    this._preItems = this.querySelectorAll('li:not([suffix])');
    this._postItems = this.querySelectorAll('li[suffix]');
  }

  public addItem(item: any) {
    if (this._openedTabs.includes(item.getAttribute('tab-uri'))) {
      return;
    }
    this._openedTabs.push(item.getAttribute('tab-uri'));
    const ul = this.shadowRoot?.querySelector('ul');
    const dropdown = this.shadowRoot?.querySelector('[id="dropdown-item"]');
    // @ts-ignore
    dropdown.querySelector('zn-dropdown').hide();
    return dropdown ? ul?.insertBefore(item, dropdown) : ul?.appendChild(item);
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    if (this.dropdown.length > 0) {
      const menu = this.shadowRoot?.querySelector('zn-menu');
      if (menu) {
        menu.addEventListener('zn-menu-select', (e: ZnMenuSelectEvent) => {
          const element = e.detail.element;
          if (element.hasAttribute('data-path')) {
            const li = document.createElement('li');
            li.setAttribute('tab-uri', (e.detail.element as HTMLElement).getAttribute('data-path') as string);
            li.innerText = (e.detail.element as HTMLElement).innerText;
            this.addItem(li);
            setTimeout(() => {
              li.click();
            }, 300);
          }
        });
      }
    }
  }

  render() {
    if (!this.navigation) {
      this.navigation = [];
    }
    const itemCount = this.navigation?.length + this._preItems?.length + this._postItems?.length;
    if (itemCount < 2 && this.hideOne) {
      this.style.display = 'none';
    }

    return html`
      <ul>
        ${this._preItems}
        ${this.navigation.map((item: any) => {
          let content = html`${item.title}`;
          if (item.icon != undefined && item.icon != '') {
            content = html`
              <zn-icon src="${item.icon}"></zn-icon>${content}`;
          }
          if (item.path != undefined) {
            return html`
              <li class="${classMap({ 'active': item.active })}" tab-uri="${item.path}">${content}</li>`;
          }
          return html`
            <li class="${classMap({ 'active': item.active })}" tab="">${content}</li>`;
        })}
        ${this.dropdown && this.dropdown.length > 0 ? html`
          <li id="dropdown-item">
            <zn-dropdown>
              <button slot="trigger">
                <zn-icon src="add" size="18"></zn-icon>
              </button>
              <zn-menu actions="${JSON.stringify(this.dropdown)}"></zn-menu>
            </zn-dropdown>
          </li>` : ''}
        ${this._postItems}
      </ul>`;
  }
}
