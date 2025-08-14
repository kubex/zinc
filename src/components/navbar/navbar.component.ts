import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {property} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import ZnDropdown from "../dropdown";
import type {ZnMenuSelectEvent} from "../../events/zn-menu-select";

import styles from './navbar.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/navbar
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-dropdown
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
  static dependencies = {
    'zn-dropdown': ZnDropdown
  };

  @property({attribute: 'navigation', type: Array}) navigation = [];
  @property({attribute: 'full-width', type: Boolean, reflect: true}) fullWidth: boolean;
  @property({attribute: 'icon-bar', type: Boolean, reflect: true}) iconBar: boolean;
  @property({attribute: 'hide-one', type: Boolean, reflect: true}) hideOne: boolean;
  @property({attribute: 'flush', type: Boolean, reflect: true}) flush: boolean = false;
  @property({type: Boolean}) stacked: boolean;
  @property({type: Array}) dropdown = [];

  private _preItems: NodeListOf<Element>;
  private _postItems: NodeListOf<Element>;
  @property()
  private _appended: Element[];
  private _expanding: NodeListOf<Element>;
  private _openedTabs: string[] = [];
  private resizeObserver: ResizeObserver | null = null;

  private _navItems: HTMLElement | null = null;
  private _expandable: HTMLElement | null = null;
  private _extendedMenu: HTMLElement | null = null;
  private _navItemsGap: number = 0;
  private _expandableMargin: number = 0;
  private _totalItemWidth: number = 0;

  appendItem(item: Element) {
    this._appended = this._appended || [];
    this._appended.push(item);
  }

  connectedCallback() {
    super.connectedCallback();
    this._preItems = this.querySelectorAll('li:not([suffix])');
    this._postItems = this.querySelectorAll('li[suffix]');
    this._expanding = this.querySelectorAll('zn-expanding-action');

    this.resizeObserver = new ResizeObserver(this.handleResize.bind(this));
    this.resizeObserver.observe(this.parentNode as HTMLElement); // Observe the parent node
  }


  handleResize = () => {
    if (this._totalItemWidth === 0 || this._extendedMenu === null) {
      // If we can't do anything with the nav items, we just return
      return;
    }

    const expandWidth = this._expandableMargin + (this._expandable?.offsetWidth || 0);
    let hasHidden = (this._navItems?.querySelectorAll('li.hidden').length || 0) > 0

    if (!hasHidden && expandWidth + this._totalItemWidth <= this.offsetWidth) {
      this._navItems?.classList.toggle('has-hidden', false)
      return
    }

    let parent = this.parentElement;
    let availableWidth = this.offsetWidth || parent?.offsetWidth || 0;

    // Needs to grab the first available width that is not 0
    // This is to avoid issues with the parent/navbar not being visible
    while (availableWidth === 0 && parent?.parentElement) {
      parent = parent.parentElement;
      availableWidth = parent.offsetWidth || 0;
    }

    availableWidth -= expandWidth;
    // reduce the items
    let takenWidth = 0;
    let hideRemaining = false;
    const items = this._navItems?.querySelectorAll(':scope > li') || [];
    this._extendedMenu.innerHTML = '';
    for (const item of items) {
      if (item.classList.contains('more') || !(item instanceof HTMLElement)) {
        continue;
      }
      const itemWidth = item.offsetWidth + this._navItemsGap + 1
      if (hideRemaining || ((itemWidth + takenWidth) > availableWidth)) {
        const extMenu = item.cloneNode(true) as HTMLElement;
        extMenu.classList.remove('hidden');
        extMenu.addEventListener('click', () => {
          item.click();
          (this.shadowRoot?.querySelector('#extended-dropdown') as ZnDropdown || null)?.hide()
        })
        this._extendedMenu?.appendChild(extMenu);
        item.classList.add('hidden');
        hasHidden = true;
        hideRemaining = true;
      } else {
        item.classList.remove('hidden');
        takenWidth += itemWidth;
      }
    }
    this._navItems?.classList.toggle('has-hidden', hasHidden && hideRemaining)
  }

  public addItem(item: any) {
    if (this._openedTabs.includes(item.getAttribute('tab-uri'))) {
      return;
    }
    this._openedTabs.push(item.getAttribute('tab-uri'));
    const ul = this.shadowRoot?.querySelector('ul');
    const dropdown = this.shadowRoot?.querySelector('[id="dropdown-item"]');
    // @ts-expect-error
    dropdown.querySelector('zn-dropdown').hide();
    return dropdown ? ul?.insertBefore(item, dropdown) : ul?.appendChild(item);
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);

    this._extendedMenu = this.shadowRoot?.querySelector('#extended-menu') as HTMLElement || null;
    this._expandable = this.shadowRoot?.querySelector('.navbar__container > div.expandables') as HTMLElement || null;
    if (this._expandable) {
      const computed = getComputedStyle(this._expandable);
      this._expandableMargin = parseInt(computed.marginLeft) + parseInt(computed.marginRight);
    }
    this._navItems = this.shadowRoot?.querySelector('.navbar__container > ul') as HTMLElement || null;
    if (this._navItems) {
      const computed = getComputedStyle(this._navItems);
      this._navItemsGap = parseInt(computed.columnGap);
    }

    setTimeout(() => {
      const items = this._navItems?.querySelectorAll('li') || [];
      for (const item of items) {
        this._totalItemWidth += item.offsetWidth + this._navItemsGap
      }

      this.handleResize();
    }, 100)

    if (this.dropdown.length > 0) {
      const menu = this.shadowRoot?.querySelector('zn-menu');
      if (menu) {
        menu.addEventListener('zn-menu-select', (e: ZnMenuSelectEvent) => {
          const element = e.detail.element;
          if (element.hasAttribute('data-path')) {
            const li = document.createElement('li');
            li.setAttribute('tab-uri', (e.detail.element as HTMLElement).getAttribute('data-path')!);
            li.innerText = e.detail.value;
            this.addItem(li);
            setTimeout(() => {
              li.click();
            }, 300);
          }
        });
      }
    }
  }

  showMore() {
    console.log("Showing More")
  }

  render() {
    if (!this.navigation) {
      this.navigation = [];
    }
    const itemCount = this.navigation?.length + this._preItems?.length + this._postItems?.length;
    if (this._expanding.length === 0) {
      if (itemCount === 0 || (itemCount < 2 && this.hideOne)) {
        this.style.display = 'none';
      }
    }

    return html`
      <div class="navbar__container">
        <ul class="${classMap({
          'navbar': true,
          'navbar--flush': this.flush
        })}">
          ${this._preItems}
          ${this.navigation.map((item: any) => {
            let content = html`${item.title}`;
            if (item.icon != undefined && item.icon != '') {
              content = html`
                <zn-icon src="${item.icon}"></zn-icon>${content}`;
            }
            if (item.path != undefined) {
              return html`
                <li class="${classMap({'active': item.active})}" tab-uri="${item.path}">${content}</li>`;
            }
            return html`
              <li class="${classMap({'active': item.active})}" tab="${item.tab}">${content}</li>`;
          })}
          <li class="more">
            <zn-dropdown placement="bottom-end" id="extended-dropdown">
              <zn-button slot="trigger" text color="transparent">
                <zn-icon src="double_arrow" size="16"></zn-icon>
              </zn-button>
              <ul id="extended-menu">
              </ul>
            </zn-dropdown>
          </li>
          ${this.dropdown && this.dropdown.length > 0 ? html`
            <li id="dropdown-item">
              <zn-dropdown>
                <zn-button slot="trigger" color="secondary" square grow>
                  <zn-icon src="add" size="18"></zn-icon>
                </zn-button>
                <zn-menu actions="${JSON.stringify(this.dropdown)}"></zn-menu>
              </zn-dropdown>
            </li>` : ''}
          ${this._postItems}
          ${this._appended}
        </ul>
        <div class="expandables">${this._expanding}</div>
      </div>`;
  }
}
