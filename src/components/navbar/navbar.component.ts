import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {ifDefined} from "lit/directives/if-defined.js";
import {MutationController} from '@lit-labs/observers/mutation-controller.js';
import {property} from 'lit/decorators.js';
import {ResizeController} from '@lit-labs/observers/resize-controller.js';
import {Store} from "../../internal/storage";
import ZincElement from '../../internal/zinc-element';
import ZnDropdown from "../dropdown";
import type {ZnMenuSelectEvent} from "../../events/zn-menu-select";

import styles from './navbar.scss';

interface StoredTab {
  uri: string;
  title: string;
}

const NAVBAR_MIN_WIDTH = 200;

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
 * @slot expand - Expanding action panels rendered alongside the navbar items.
 * @slot bottom - Content rendered below the navbar row (e.g. chips, filters).
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
  private _expanding: Element[] = [];
  private _openedTabs: string[] = [];

  private readonly _itemsObserver = new MutationController(this, {
    target: null,
    config: {childList: true},
    callback: () => this._updateVisibility(),
  });

  private _navItems: HTMLElement | null = null;
  private _expandable: HTMLElement | null = null;
  private _extendedMenu: HTMLElement | null = null;
  private readonly _cloneSources = new WeakMap<HTMLElement, HTMLElement>();
  private _navItemsGap: number = 0;
  private _expandableMargin: number = 0;
  private _totalItemWidth: number = 0;
  private _resizeFrame: number | null = null;
  private _resizeController: ResizeController;

  protected _store: Store;

  appendItem(item: Element) {
    this._appended = [...(this._appended || []), item];
  }

  addExpandingAction(action: Element) {
    if (!this._expanding.includes(action)) {
      this._expanding = [...this._expanding, action];
    }

    if (action.parentElement !== this) {
      this.appendChild(action);
    }

    this.requestUpdate();
    this._updateVisibility();
    this._observeExpandingAction(action);
    this._scheduleResize();
  }

  constructor() {
    super();
    this._resizeController = new ResizeController(this, {
      callback: () => this._scheduleResize(),
    });
    // eslint-disable-next-line no-new
    new MutationController(this, {
      config: {childList: true},
      callback: mutations => this._adoptNewLightItems(mutations),
    });
  }

  private readonly _expandingActionObserver = new MutationController(this, {
    target: null,
    config: {attributes: true, attributeFilter: ['open', 'method', 'basis']},
    callback: () => this._scheduleResize(),
  });

  private _scheduleResize = () => {
    if (this._resizeFrame !== null) {
      cancelAnimationFrame(this._resizeFrame);
    }

    this._resizeFrame = requestAnimationFrame(() => {
      this._resizeFrame = null;
      this.handleResize();
    });
  };

  private _observeExpandingAction(action: Element) {
    this._expandingActionObserver.observe(action);
    this._resizeController.observe(action);
  }

  private _adoptNewLightItems(mutations: MutationRecord[]) {
    const ul = this.shadowRoot?.querySelector('ul');
    if (!ul) return;
    const moreItem = ul.querySelector('li.more');
    for (const m of mutations) {
      for (const node of Array.from(m.addedNodes)) {
        if (node instanceof Element && node.tagName === 'ZN-EXPANDING-ACTION') {
          this.addExpandingAction(node);
          continue;
        }

        if (!(node instanceof HTMLLIElement)) continue;
        if (node.hasAttribute('suffix')) continue;
        if (moreItem) {
          ul.insertBefore(node, moreItem);
        } else {
          ul.appendChild(node);
        }
      }
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this._preItems = this.querySelectorAll('li:not([suffix])');
    this._postItems = this.querySelectorAll('li[suffix]');
    this._expanding = Array.from(this.querySelectorAll('zn-expanding-action'));

    if (!this.masterId) {
      this.masterId = this.storeKey || Math.floor(Math.random() * 1000000).toString();
    }

    if (this.storeKey && this.storeTtl === 0) {
      this.storeTtl = 300;
    }

    this._store = new Store(this.localStorage ? window.localStorage : window.sessionStorage, "znnav:", this.storeTtl);
  }

  private _updateVisibility = () => {
    if (this._expanding.length > 0) {
      this.style.display = '';
      return;
    }

    const itemCount = this.itemCount()
    if (itemCount === 0 || (itemCount < 2 && this.hideOne)) {
      this.style.display = 'none';
    } else {
      this.style.display = '';
    }
  };

  itemCount(): number {
    const items = this._navItems?.querySelectorAll(':scope > li:not(.more):not(#dropdown-item)') || [];
    return items.length;
  }

  private _resolveAvailableWidth(): number {
    let parent = this.parentElement;
    let availableWidth = this.offsetWidth || parent?.offsetWidth || 0;

    // Needs to grab the first available width that is 0
    // This is to avoid issues with the parent/navbar not being visible
    while (availableWidth === 0 && parent?.parentElement) {
      parent = parent.parentElement;
      availableWidth = parent.offsetWidth || 0;
    }

    return availableWidth;
  }

  private _measureTotalItemWidth(): number {
    const items = this._navItems?.querySelectorAll(':scope > li') || [];
    let totalWidth = 0;

    for (const item of items) {
      if (item.classList.contains('more') || !(item instanceof HTMLElement)) {
        continue;
      }

      totalWidth += this._getItemWidth(item);
    }

    return totalWidth;
  }

  private _getItemWidth(item: HTMLElement): number {
    return (item.getBoundingClientRect().width || item.offsetWidth || 0) + this._navItemsGap + 5;
  }

  private _getHorizontalSpacing(element: HTMLElement): number {
    const computed = getComputedStyle(element);
    return (parseFloat(computed.paddingLeft) || 0) + (parseFloat(computed.paddingRight) || 0);
  }

  private _getMoreItemWidth(): number {
    const moreItem = this._navItems?.querySelector<HTMLElement>(':scope > li.more');
    if (!moreItem || !this._navItems) {
      return 0;
    }

    let moreWidth = this._getItemWidth(moreItem);
    if (moreWidth > 0) {
      return moreWidth;
    }

    const hadHidden = this._navItems.classList.contains('has-hidden');
    this._navItems.classList.add('has-hidden');
    moreWidth = this._getItemWidth(moreItem);
    this._navItems.classList.toggle('has-hidden', hadHidden);

    return moreWidth;
  }

  private _syncLastVisibleItem() {
    const items = this._navItems?.querySelectorAll<HTMLElement>(':scope > li') || [];
    let lastVisibleItem: HTMLElement | null = null;

    for (const item of items) {
      item.classList.remove('last-visible');

      if (item.classList.contains('more') || item.classList.contains('hidden') || item.id === 'dropdown-item') {
        continue;
      }

      lastVisibleItem = item;
    }

    lastVisibleItem?.classList.add('last-visible');
    this._navItems?.classList.toggle('more-only', !lastVisibleItem && this._navItems.classList.contains('has-hidden'));
  }

  private _getExpandableWidth(containerWidth: number): number {
    const expandableWidth = this._expandableMargin + (this._expandable?.getBoundingClientRect().width || this._expandable?.offsetWidth || 0);
    let fillWidth = 0;

    for (const action of this._expanding) {
      if (!(action instanceof HTMLElement)) {
        continue;
      }

      const method = (action as HTMLElement & {method?: string}).method || action.getAttribute('method') || 'drop';
      const open = Boolean((action as HTMLElement & {open?: boolean}).open || action.hasAttribute('open'));

      if (method !== 'fill' || !open) {
        continue;
      }

      const panel = action.shadowRoot?.querySelector<HTMLElement>('.expanding-action--fill');
      const panelWidth = panel?.getBoundingClientRect().width || 0;
      fillWidth = Math.max(fillWidth, panelWidth, Math.min(containerWidth, 800));
    }

    return Math.max(expandableWidth, fillWidth);
  }

  handleResize = () => {
    if (this._extendedMenu === null || this.iconBar || this.stacked) {
      // If we can't do anything with the nav items, we just return
      return;
    }

    const availableContainerWidth = this._resolveAvailableWidth();
    const expandWidth = this._getExpandableWidth(availableContainerWidth);
    this._totalItemWidth = this._measureTotalItemWidth();
    if (this._totalItemWidth === 0) {
      return;
    }

    let hasHidden = (this._navItems?.querySelectorAll('li.hidden').length || 0) > 0

    const navSpacing = this._navItems ? this._getHorizontalSpacing(this._navItems) : 0;
    const availableWidth = Math.max(availableContainerWidth - expandWidth, NAVBAR_MIN_WIDTH);
    const availableWithoutMore = availableWidth - navSpacing;

    if (!hasHidden && this._totalItemWidth <= availableWithoutMore) {
      this._navItems?.classList.toggle('has-hidden', false)
      this._syncLastVisibleItem();
      return
    }

    const moreWidth = this._getMoreItemWidth();
    const availableWithMore = availableWithoutMore - moreWidth;
    // reduce the items
    let takenWidth = 0;
    let hideRemaining = false;
    const items = this._navItems?.querySelectorAll(':scope > li') || [];
    this._extendedMenu.innerHTML = '';
    for (const item of items) {
      if (item.classList.contains('more') || !(item instanceof HTMLElement)) {
        continue;
      }
      const itemWidth = this._getItemWidth(item);
      if (hideRemaining || ((itemWidth + takenWidth) > availableWithMore)) {
        const extMenu = item.cloneNode(true) as HTMLElement;
        extMenu.classList.remove('hidden');
        this._cloneSources.set(extMenu, item);
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
    this._syncLastVisibleItem();
  }

  // Clones in the extended menu are static snapshots, so mirror the active
  // state of their source items each time the dropdown opens.
  private _syncExtendedActive = () => {
    const clones = this._extendedMenu?.querySelectorAll<HTMLElement>(':scope > li') || [];
    for (const clone of clones) {
      const source = this._cloneSources.get(clone);
      if (!source) continue;
      clone.classList.toggle('active', source.classList.contains('active'));
      clone.classList.toggle('zn-tb-active', source.classList.contains('zn-tb-active'));
    }
  };

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

    this._updateVisibility();
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);

    this._extendedMenu = this.shadowRoot?.querySelector('#extended-menu') as HTMLElement || null;
    this.shadowRoot?.querySelector('#extended-dropdown')?.addEventListener('zn-show', this._syncExtendedActive);
    this._expandable = this.shadowRoot?.querySelector('.navbar__container > div.expandables') as HTMLElement || null;
    if (this._expandable) {
      const computed = getComputedStyle(this._expandable);
      this._expandableMargin = (parseFloat(computed.marginLeft) || 0) + (parseFloat(computed.marginRight) || 0);
      this._resizeController.observe(this._expandable);
    }
    this._navItems = this.shadowRoot?.querySelector('.navbar__container > ul') as HTMLElement || null;
    if (this._navItems) {
      const computed = getComputedStyle(this._navItems);
      this._navItemsGap = parseFloat(computed.columnGap) || 0;
      this._resizeController.observe(this._navItems);

      this._navItems.addEventListener('click', (e) => {
        const target = (e.target as HTMLElement).closest('li[tab-uri]');
        if (target && this.storeKey) {
          const uri = target.getAttribute('tab-uri');
          if (uri) {
            this._store.set(this.storeKey + ':active', uri);
          }
        }
      });
    }

    // Load persisted tabs before calculating widths
    this._loadStoredTabs();

    if (this._navItems) {
      this._itemsObserver.observe(this._navItems);
    }
    this._expanding.forEach(action => this._observeExpandingAction(action));
    this._updateVisibility();

    setTimeout(() => {
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
    const activeUri = this._store.get(this.storeKey + ':active');
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

              if (activeUri && tab.uri === activeUri) {
                setTimeout(() => {
                  li.click();
                }, 100);
              }
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

  protected updated(_changedProperties: PropertyValues) {
    super.updated(_changedProperties);
    if (_changedProperties.has('hideOne') || _changedProperties.has('navigation') || _changedProperties.has('_appended')) {
      this._updateVisibility();
    }
  }

  render() {
    if (!this.navigation) {
      this.navigation = [];
    }

    return html`
      <div part="container" class="${classMap({
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
                <zn-icon src="${item.icon}" size="20"></zn-icon>${content}`;
            }
            if (item.path != undefined) {
              return html`
                <li class="${classMap({'active': item.active})}" part="navbar-item" tab-uri="${item.path}">${content}
                </li>`;
            }
            return html`
              <li class="${classMap({'active': item.active})}"
                  part="navbar-item"
                  tab="${ifDefined(!this.isolated ? item.tab : undefined)}"
                  data-tab="${ifDefined(this.isolated ? item.tab : undefined)}">
                ${content}
              </li>`;
          })}
          <li class="more">
            <zn-dropdown placement="bottom-end" id="extended-dropdown" distance="1">
              <zn-button slot="trigger" text color="transparent">
                <zn-icon src="arrow_right_alt" size="16"></zn-icon>
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
      </div>
      <slot name="bottom" part="bottom"></slot>`;
  }
}
