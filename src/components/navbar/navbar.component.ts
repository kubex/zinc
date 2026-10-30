import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {ifDefined} from "lit/directives/if-defined.js";
import {MutationController} from '@lit-labs/observers/mutation-controller.js';
import {property} from 'lit/decorators.js';
import {ResizeController} from '@lit-labs/observers/resize-controller.js';
import {type IndicatorEdges, slideTabIndicator, squishTabIndicator} from "../../internal/tab-indicator";
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
// Room a scroll arrow covers at either edge of the strip; keep in sync with --navbar-scroll-size in navbar.scss
const NAVBAR_SCROLL_EDGE = 56;

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
 * @csspart indicator - The active-tab indicator that slides between tabs. Exposes
 *   `--zn-navbar-indicator-top` / `--zn-navbar-indicator-height` (the active tab's box) for styles that fill the tab.
 *
 * @cssproperty --zn-navbar-tab-indicator-slide - `1` shows the sliding indicator in place of each tab's own line.
 * @cssproperty --zn-navbar-tab-indicator-duration - Duration of the indicator's leading edge (default 300ms).
 * @cssproperty --zn-navbar-tab-indicator-easing - Easing of both indicator edges.
 * @cssproperty --zn-navbar-tab-indicator-trail-duration - Duration of the trailing edge; longer than the lead stretches the indicator.
 * @cssproperty --zn-navbar-tab-indicator-trail-easing - Easing of the trailing edge; defaults to `--zn-navbar-tab-indicator-easing`.
 * @cssproperty --zn-navbar-tab-indicator-trail-delay - Delay before the trailing edge follows (default 0ms).
 * @cssproperty --zn-navbar-tab-indicator-delay - Delay before the indicator starts to move (default 0ms).
 * @cssproperty --zn-navbar-tab-indicator-squash - Vertical scale the indicator squishes to before it travels (default 1, off).
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
  @property({attribute: 'gutter', type: Boolean, reflect: true}) gutter: boolean = false;
  /** Draws the tabs as a segmented control: a grey track with a pill that slides to the active tab. */
  @property({type: Boolean, reflect: true}) pill: boolean = false;
  /** With `pill`, `small` draws a shorter track to sit with small controls, such as above a form field. */
  @property({reflect: true}) size: 'small' | 'medium' = 'medium';
  /** The id of a zn-tabs elsewhere on the page that this navbar's tabs switch, such as one below a page header. */
  @property({reflect: true}) tabs: string;
  @property({type: Boolean}) stacked: boolean;
  @property({type: Array}) dropdown = [];
  @property({attribute: "no-pad", type: Boolean}) noPad: false
  @property({attribute: 'manual-add-items', type: Boolean}) manualAddItems = false;
  @property({type: Boolean}) isolated = false;
  @property({reflect: true}) color: string;

  @property({attribute: 'master-id', reflect: true}) masterId: string;
  @property({attribute: 'store-key', type: String}) storeKey: string = '';
  @property({attribute: 'store-ttl', type: Number, reflect: true}) storeTtl = 0;
  @property({attribute: 'local-storage', type: Boolean, reflect: true}) localStorage: boolean;

  private _preItems: HTMLElement[] = [];
  private _postItems: HTMLElement[] = [];
  @property()
  private _appended: Element[];
  private _expanding: Element[] = [];
  private _openedTabs: string[] = [];

  private readonly _itemsObserver = new MutationController(this, {
    target: null,
    config: {childList: true},
    callback: () => this._updateVisibility(),
  });

  private readonly _activeObserver = new MutationController(this, {
    target: null,
    config: {attributes: true, attributeFilter: ['class'], subtree: true, childList: true},
    callback: () => this._scheduleIndicatorSync(),
  });

  private _navItems: HTMLElement | null = null;
  private _strip: HTMLElement | null = null;
  private _indicator: HTMLElement | null = null;
  private _indicatorFrame: number | null = null;
  private _indicatorTab: HTMLElement | null = null;
  private _indicatorTarget: IndicatorEdges | null = null;
  private _expandable: HTMLElement | null = null;
  private readonly _lightDomClones = new WeakMap<HTMLElement, HTMLElement>();
  private _expandableMargin: number = 0;
  private _resizeFrame: number | null = null;
  private _resizeController: ResizeController;

  protected _store: Store;

  appendItem(item: Element) {
    this._appended = [...(this._appended || []), item];
  }

  private _cloneLightItem(item: HTMLElement): HTMLElement {
    const existing = this._lightDomClones.get(item);
    if (existing) {
      return existing;
    }

    const clone = item.cloneNode(true) as HTMLElement;
    this._lightDomClones.set(item, clone);
    clone.addEventListener('click', () => item.click());
    return clone;
  }

  private _syncLightDomItems() {
    const preItems: HTMLElement[] = [];
    const postItems: HTMLElement[] = [];

    Array.from(this.children).forEach(child => {
      if (!(child instanceof HTMLElement) || child.tagName !== 'LI') {
        return;
      }

      const clone = this._cloneLightItem(child);
      if (child.hasAttribute('suffix')) {
        postItems.push(clone);
      } else {
        preItems.push(clone);
      }
    });

    this._preItems = preItems;
    this._postItems = postItems;
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
      // Synced here as well as after the layout pass: the indicator's right edge is
      // measured from the container, so a stale value would stretch it until the next frame.
      callback: () => {
        this._syncIndicator();
        this._scheduleResize();
      },
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
      this._syncIndicator();
    });
  };

  private _scheduleIndicatorSync = () => {
    if (this._indicatorFrame !== null) {
      cancelAnimationFrame(this._indicatorFrame);
    }

    this._indicatorFrame = requestAnimationFrame(() => {
      this._indicatorFrame = null;
      this._syncIndicator();
    });
  };

  /** Moves the shared active-tab indicator under the active tab. */
  private _syncIndicator() {
    const indicator = this._indicator;
    const container = indicator?.parentElement;
    if (!indicator || !container) {
      return;
    }

    const active = this.stacked || this.iconBar ? null : this._navItems?.querySelector<HTMLElement>(
      ':scope > li.active, :scope > li.zn-tb-active');
    const tab = active?.getBoundingClientRect();
    if (!tab || tab.width === 0) {
      indicator.classList.remove('navbar__indicator--shown');
      this._indicatorTarget = null;
      return;
    }

    // The indicator scrolls with the tabs, so it is placed in the strip's content coordinates
    const box = container.getBoundingClientRect();
    const originLeft = box.left - container.scrollLeft;
    const target = {left: tab.left - originLeft, right: tab.right - originLeft};
    const previous = this._indicatorTarget;
    const tabChanged = active !== this._indicatorTab;
    const ready = indicator.classList.contains('navbar__indicator--ready');
    this._indicatorTab = active ?? null;
    if (tabChanged && active) {
      this._revealTab(active, ready);
    }
    // Exposed for ::part(indicator) styles that fill the tab rather than underline it.
    indicator.style.setProperty('--zn-navbar-indicator-top', `${tab.top - box.top}px`);
    indicator.style.setProperty('--zn-navbar-indicator-height', `${tab.height}px`);
    indicator.classList.add('navbar__indicator--shown');
    if (previous && Math.abs(previous.left - target.left) < 0.5 && Math.abs(previous.right - target.right) < 0.5) {
      return;
    }

    // Only a tab change slides; a resize or reflow under the same tab follows it instantly, unless a slide is still
    // running and should retarget. Either way the slide starts from where the indicator is drawn right now.
    const slide = ready && previous !== null && (tabChanged || indicator.getAnimations().length > 0);
    const drawn = indicator.getBoundingClientRect();
    if (slide && tabChanged) {
      squishTabIndicator(indicator);
    }

    indicator.style.left = `${target.left}px`;
    indicator.style.width = `${target.right - target.left}px`;
    this._indicatorTarget = target;
    if (slide) {
      slideTabIndicator(indicator, {left: drawn.left - originLeft, right: drawn.right - originLeft}, target);
    }

    // The first placement jumps into position; only later moves animate.
    if (!ready) {
      requestAnimationFrame(() => indicator.classList.add('navbar__indicator--ready'));
    }
  }


  private _observeExpandingAction(action: Element) {
    this._expandingActionObserver.observe(action);
    this._resizeController.observe(action);
  }

  private _adoptNewLightItems(mutations: MutationRecord[]) {
    for (const m of mutations) {
      for (const node of Array.from(m.addedNodes)) {
        if (node instanceof Element && node.tagName === 'ZN-EXPANDING-ACTION') {
          this.addExpandingAction(node);
        }
      }
    }

    if (mutations.some(mutation =>
      Array.from(mutation.addedNodes).some(node => node instanceof HTMLLIElement) ||
      Array.from(mutation.removedNodes).some(node => node instanceof HTMLLIElement)
    )) {
      this._syncLightDomItems();
      this.requestUpdate();
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this._syncLightDomItems();
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
    const items = this._navItems?.querySelectorAll(':scope > li:not(#dropdown-item)') || [];
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

  private _syncLastVisibleItem() {
    const items = this._navItems?.querySelectorAll<HTMLElement>(':scope > li') || [];
    let lastVisibleItem: HTMLElement | null = null;

    for (const item of items) {
      item.classList.remove('last-visible');
      if (item.id !== 'dropdown-item') {
        lastVisibleItem = item;
      }
    }

    lastVisibleItem?.classList.add('last-visible');
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
    if (!this._strip) {
      // If we can't do anything with the nav items, we just return
      return;
    }

    // An open fill panel overlays the strip, so the tabs give way to it and scroll instead
    const availableContainerWidth = this._resolveAvailableWidth();
    const expandWidth = this._getExpandableWidth(availableContainerWidth);
    const fillOpen = this._expanding.some(action => action.getAttribute('method') === 'fill' && action.hasAttribute('open'));
    this._strip.style.maxWidth = fillOpen ? `${Math.max(availableContainerWidth - expandWidth, NAVBAR_MIN_WIDTH)}px` : '';

    // The tabs' own side spacing scrolls with them, so the arrows sit in from the strip's edges by as much
    const style = getComputedStyle(this._navItems!);
    const startInset = (parseFloat(style.marginLeft) || 0) + (parseFloat(style.paddingLeft) || 0);
    const endInset = (parseFloat(style.marginRight) || 0) + (parseFloat(style.paddingRight) || 0);
    this._strip.style.setProperty('--navbar-scroll-inset-start', `${Math.max(startInset, 0)}px`);
    this._strip.style.setProperty('--navbar-scroll-inset-end', `${Math.max(endInset, 0)}px`);

    this._syncLastVisibleItem();
    this._syncScrollEdges();
  }

  /** Shows a scroll arrow at each edge of the strip that has tabs beyond it. */
  private _syncScrollEdges = () => {
    const strip = this._strip;
    if (!strip) {
      return;
    }

    const maxScroll = strip.scrollWidth - strip.clientWidth;
    strip.classList.toggle('navbar__strip--scroll-start', strip.scrollLeft > 1);
    strip.classList.toggle('navbar__strip--scroll-end', strip.scrollLeft < maxScroll - 1);
  };

  private _scrollTabs(direction: 1 | -1) {
    const strip = this._strip;
    strip?.scrollBy({left: direction * Math.max(strip.clientWidth - NAVBAR_SCROLL_EDGE * 2, NAVBAR_SCROLL_EDGE), behavior: 'smooth'});
  }

  /** Scrolls the strip so the tab clears the scroll arrows. */
  private _revealTab(tab: HTMLElement, smooth: boolean) {
    const strip = this._strip;
    if (!strip || strip.scrollWidth <= strip.clientWidth) {
      return;
    }

    const start = tab.offsetLeft - NAVBAR_SCROLL_EDGE;
    const end = tab.offsetLeft + tab.offsetWidth + NAVBAR_SCROLL_EDGE - strip.clientWidth;
    const left = start < strip.scrollLeft ? start : end > strip.scrollLeft ? end : null;
    if (left !== null) {
      strip.scrollTo({left, behavior: smooth ? 'smooth' : 'instant'});
    }
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

    this._updateVisibility();
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);

    this._expandable = this.shadowRoot?.querySelector('.navbar__container > div.expandables') as HTMLElement || null;
    if (this._expandable) {
      const computed = getComputedStyle(this._expandable);
      this._expandableMargin = (parseFloat(computed.marginLeft) || 0) + (parseFloat(computed.marginRight) || 0);
      this._resizeController.observe(this._expandable);
    }
    this._navItems = this.shadowRoot?.querySelector('ul.navbar') as HTMLElement || null;
    if (this._navItems) {
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

    this._strip = this.shadowRoot?.querySelector<HTMLElement>('.navbar__strip') ?? null;
    if (this._strip) {
      this._strip.addEventListener('scroll', this._syncScrollEdges, {passive: true});
      this._resizeController.observe(this._strip);
    }
    this._indicator = this.shadowRoot?.querySelector('.navbar__indicator') as HTMLElement || null;
    if (this._indicator?.parentElement) {
      // Tabs can shift inside a resized container while the tab strip keeps its size.
      this._resizeController.observe(this._indicator.parentElement);
    }
    if (this._navItems) {
      this._itemsObserver.observe(this._navItems);
      this._activeObserver.observe(this._navItems);
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
    const indicator = html`<span class="navbar__indicator" part="indicator" aria-hidden="true"></span>`;
    const list = html`
      <ul @click="${this.handleClick}" part="navbar" class="${classMap({
        'navbar': true,
        'navbar--slim': this.slim,
        'navbar--border': this.border,
        'navbar--flush': this.flush,
        'navbar--no-pad': this.noPad,
        'navbar--stacked': this.stacked,
        'navbar--icon-bar': this.iconBar,
        [`navbar--color-${this.color}`]: Boolean(this.color)
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
      </ul>`;

    return html`
      <div part="container" class="${classMap({
        'navbar__container': true,
        'navbar__container--stacked': this.stacked,
        'navbar__container--icon-bar': this.iconBar
      })}">
        ${this.stacked || this.iconBar ? html`${list}${indicator}` : html`
          <div class="navbar__strip">
            <span class="navbar__scroll navbar__scroll--start">
              <button type="button" class="navbar__scroll-button" aria-label="Scroll tabs back"
                      @click="${() => this._scrollTabs(-1)}">
                <zn-icon src="arrow_back" size="18"></zn-icon>
              </button>
            </span>
            ${list}
            ${indicator}
            <span class="navbar__scroll navbar__scroll--end">
              <button type="button" class="navbar__scroll-button" aria-label="Scroll tabs forward"
                      @click="${() => this._scrollTabs(1)}">
                <zn-icon src="arrow_forward" size="18"></zn-icon>
              </button>
            </span>
          </div>`}
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
