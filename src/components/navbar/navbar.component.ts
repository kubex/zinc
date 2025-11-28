import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {ifDefined} from "lit/directives/if-defined.js";
import {property} from 'lit/decorators.js';
import {Store} from "../../internal/storage";
import ZincElement from '../../internal/zinc-element';
import ZnDropdown from "../dropdown";
import type {ZnMenuSelectEvent} from "../../events/zn-menu-select";

import styles from './navbar.scss';

interface StoredTab {
  uri: string;
  title: string;
}

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
  @property({attribute: 'slim', type: Boolean, reflect: true}) slim: boolean;
  @property({attribute: 'border', type: Boolean, reflect: true}) border: boolean;
  @property({attribute: 'hide-one', type: Boolean, reflect: true}) hideOne: boolean;
  @property({attribute: 'flush', type: Boolean, reflect: true}) flush: boolean = false;
  @property({type: Boolean}) stacked: boolean;
  @property({type: Array}) dropdown = [];
  @property({attribute: "no-pad", type: Boolean}) noPad: false
  @property({attribute: 'manual-add-items', type: Boolean}) manualAddItems = false;
  @property({type: Boolean}) isolated = false;

  @property({attribute: 'master-id', reflect: true}) masterId: string;
  @property({attribute: 'store-key', type: String}) storeKey: string = '';
  @property({attribute: 'store-ttl', type: Number, reflect: true}) storeTtl = 0;
  @property({attribute: 'local-storage', type: Boolean, reflect: true}) localStorage: boolean;

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

  protected _store: Store;

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
    this.resizeObserver.observe(this as HTMLElement); // Observe the parent node

    if (!this.masterId) {
      this.masterId = this.storeKey || Math.floor(Math.random() * 1000000).toString();
    }

    if (this.storeKey && this.storeTtl === 0) {
      this.storeTtl = 300;
    }

    this._store = new Store(this.localStorage ? window.localStorage : window.sessionStorage, "znnav:", this.storeTtl);
  }


  handleResize = () => {
    if (this._totalItemWidth === 0 || this._extendedMenu === null || this.iconBar || this.stacked) {
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

    // Needs to grab the first available width that is 0
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
      const itemWidth = item.offsetWidth + this._navItemsGap + 5
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

  public addItem(item: Element, persist: boolean = true): void {
    const tabUri = item.getAttribute('tab-uri');
    if (typeof tabUri !== 'string' || this._openedTabs.includes(tabUri)) {
      return;
    }
    this._openedTabs.push(tabUri);
    const ul = this.shadowRoot?.querySelector('ul');
    const dropdown = this.shadowRoot?.querySelector('[id="dropdown-item"]');

    if (persist && dropdown) {
      dropdown.querySelector('zn-dropdown')?.hide();
      this._saveTabToStorage({
        uri: tabUri,
        title: (item as HTMLElement).innerText
      });
    }

    if (dropdown) {
      ul?.insertBefore(item, dropdown);
    } else {
      ul?.appendChild(item);
    }
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

    // Load persisted tabs before calculating widths
    this._loadStoredTabs();

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
          if (this.manualAddItems) {
            return;
          }
          const element = e.detail.element;
          if (element.hasAttribute('data-path')) {
            const li = document.createElement('li');
            li.setAttribute('tab-uri', (e.detail.element as HTMLElement).getAttribute('data-path')!);
            li.innerText = e.detail.value;
            this.addItem(li, true);
            setTimeout(() => {
              li.click();
            }, 300);
          }
        });
      }
    }
  }

  private _loadStoredTabs() {
    if (!this.storeKey || !this._store) return;

    const storedData = this._store.get(this.storeKey);
    if (storedData) {
      try {
        const tabs = JSON.parse(storedData) as StoredTab[];
        if (Array.isArray(tabs)) {
          tabs.forEach(tab => {
            if (tab.uri && tab.title) {
              const li = document.createElement('li');
              li.setAttribute('tab-uri', tab.uri);
              li.innerText = tab.title;
              // Pass false to avoid re-saving what was just read
              this.addItem(li, false);
            }
          });
        }
      } catch (e) {
        console.warn('ZnNavbar: Failed to load stored tabs', e);
      }
    }
  }

  private _saveTabToStorage(newTab: StoredTab) {
    if (!this.storeKey || !this._store) return;

    try {
      const storedData = this._store.get(this.storeKey);
      let tabs: StoredTab[] = [];
      if (storedData) {
        tabs = JSON.parse(storedData) as StoredTab[];
      }

      // Ensure we don't save duplicates
      if (!tabs.some(t => t.uri === newTab.uri)) {
        tabs.push(newTab);
        this._store.set(this.storeKey, JSON.stringify(tabs));
      }
    } catch (e) {
      console.warn('ZnNavbar: Failed to save tab', e);
    }
  }

  private handleClick = (e: MouseEvent) => {
    const path = e.composedPath();
    const tabAttr = this.isolated ? 'data-tab' : 'tab';
    const li = path.find(el => el instanceof HTMLElement && el.tagName === 'LI' && (el.hasAttribute(tabAttr) || el.hasAttribute('tab-uri'))) as HTMLElement;

    if (li) {
      e.stopPropagation();
      this.emit('zn-select', {detail: {item: li}});
    }
  };

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
      <div class="${classMap({
        'navbar__container': true,
        'navbar__container--stacked': this.stacked,
        'navbar__container--icon-bar': this.iconBar
      })}">
        <ul @click="${this.handleClick}" part="navbar" class="${classMap({
          'navbar': true,
          'navbar--slim': this.slim,
          'navbar--border': this.border,
          'navbar--flush': this.flush,
          'navbar--no-pad': this.noPad,
          'navbar--stacked': this.stacked,
          'navbar--icon-bar': this.iconBar
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
                <li class="${classMap({'active': item.active})}" part="navbar-item" tab-uri="${item.path}">${content}</li>`;
            }
            return html`
              <li class="${classMap({ 'active': item.active })}"
                  part="navbar-item"
                  tab="${ifDefined(!this.isolated ? item.tab : undefined)}"
                  data-tab="${ifDefined(this.isolated ? item.tab : undefined)}">
                ${content}
              </li>`;
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
                <zn-button slot="trigger" part="button" exportparts="base:button__base" color="secondary" square grow>
                  <zn-icon src="add" size="18"></zn-icon>
                </zn-button>
                <zn-menu actions="${JSON.stringify(this.dropdown)}"></zn-menu>
              </zn-dropdown>
            </li>` : ''}
          ${this._postItems}
          ${this._appended}
        </ul>
        ${this._expanding?.length > 0 ? html`
          <div class="expandables">
            ${this._expanding}
            <slot name="expand"></slot>
          </div>
        ` : ''}
      </div>`;
  }
}
