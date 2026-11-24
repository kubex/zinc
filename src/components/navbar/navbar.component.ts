import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {deepQueryAll} from '../../utilities/query';
import {ifDefined} from "lit/directives/if-defined.js";
import {type IndicatorEdges, slideTabIndicator, squishTabIndicator} from "../../internal/tab-indicator";
import {MutationController} from '@lit-labs/observers/mutation-controller.js';
import {property, state} from 'lit/decorators.js';
import {ResizeController} from '@lit-labs/observers/resize-controller.js';
import {Store} from "../../internal/storage";
import ZincElement from '../../internal/zinc-element';
import ZnDropdown from "../dropdown";
import ZnTooltip from "../tooltip";
import type {ZnMenuSelectEvent} from "../../events/zn-menu-select";

import styles from './navbar.scss';

interface NavItem {
  title?: string;
  icon?: string;
  iconSize?: number;
  iconColor?: string;
  label?: string;
  /** A selector whose matches are counted, or the count itself, such as a total from the server. */
  count?: string | number;
  /** Colours the count while it is above 0, such as `error` for a count of things overdue. A count of 0 is muted. */
  countColor?: 'error' | 'warning' | 'success' | 'info' | 'grey';
  active?: boolean;
  path?: string | null;
  tab?: string;
}

interface StoredTab {
  uri: string;
  title: string;
}

const NAVBAR_MIN_WIDTH = 200;

// Runs on every resize: an unchanged write still invalidates style in Safari, so the next read forces another layout
function setStyle(el: HTMLElement, name: string, value: string) {
  if (el.style.getPropertyValue(name) !== value) {
    el.style.setProperty(name, value);
  }
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
 * @slot expand - Expanding action panels rendered alongside the navbar items.
 * @slot bottom - Content rendered below the navbar row (e.g. chips, filters).
 *
 * @csspart base - The component's base wrapper.
 * @csspart count - The count badge of a navigation item with a `count`.
 * @csspart navbar-item-body - A navigation item's icon, title and count, filled on hover by
 *   `--zn-navbar-tab-body-hover-background`.
 * @csspart indicator - The active-tab indicator that slides between tabs. Exposes
 *   `--zn-navbar-indicator-top` / `--zn-navbar-indicator-height` (the active tab's box) for styles that fill the tab.
 *
 * @cssproperty --zn-navbar-tab-body-hover-background - Fills a hovered tab's icon, title and count (default transparent).
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
    'zn-dropdown': ZnDropdown,
    'zn-tooltip': ZnTooltip
  };

  @property({attribute: 'navigation', type: Array}) navigation: NavItem[] = [];
  /** Stretches the tabs to share the navbar's full width equally. */
  @property({attribute: 'full-width', type: Boolean, reflect: true}) fullWidth: boolean;
  /**
   * Tight tabs for a narrow column of icon tabs: little padding around each, and a rounded fill around a hovered tab's
   * icon and count that spans its cell. Pair with `full-width`.
   */
  @property({type: Boolean, reflect: true}) compact = false;
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
  /** How item counts show: `badge`, a pill after the title, or `inline`, plain text after a separator (`Unread · 6`). */
  @property({attribute: 'count-style', reflect: true}) countStyle: 'badge' | 'inline' = 'badge';
  /** Shows a count of 0 rather than hiding the badge when a `count` selector matches nothing. */
  @property({attribute: 'show-zero-counts', type: Boolean}) showZeroCounts = false;

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
  private _more: HTMLElement | null = null;
  private _indicator: HTMLElement | null = null;
  private _indicatorFrame: number | null = null;
  private _indicatorTab: HTMLElement | null = null;
  private _indicatorTarget: IndicatorEdges | null = null;
  private _expandable: HTMLElement | null = null;
  private readonly _lightDomClones = new WeakMap<HTMLElement, HTMLElement>();
  /** Matches for each navigation item's `count` selector, by item index; undefined for items without one. */
  @state() private _counts: (number | undefined)[] = [];
  private _countObserver: MutationObserver | null = null;
  private _countRoots: Node[] = [];
  private _countFrame: number | null = null;
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
    // The click is forwarded to the source item, so a clone that kept its link would navigate a second time
    clone.removeAttribute('href');
    clone.removeAttribute('data-uri');
    this._lightDomClones.set(item, clone);
    // A control inside the item, such as a date range's picker, prevents default on clicks it has handled
    clone.addEventListener('click', e => e.defaultPrevented || item.click());
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
      // Measured here, straight after layout, where reads are free. Deferred to a frame, the reads land after the next
      // drag step has dirtied layout and force a full page layout (tens of ms in Safari). Writes only happen on change.
      // No entries means the controller's own call from hostUpdated, mid-render, where reading forces a layout.
      callback: (entries: ResizeObserverEntry[]) => {
        if (!entries.length) {
          this._scheduleResize();
          return;
        }
        this.handleResize();
        this._syncIndicator();
      },
    });
    // eslint-disable-next-line no-new
    new MutationController(this, {
      config: {childList: true},
      callback: mutations => this._adoptNewLightItems(mutations),
    });
    // eslint-disable-next-line no-new
    new MutationController(this, {
      config: {attributes: true, attributeFilter: ['class'], subtree: true},
      callback: mutations => this._mirrorLightItemActive(mutations),
    });
    // eslint-disable-next-line no-new
    new MutationController(this, {
      config: {childList: true, characterData: true, subtree: true},
      callback: mutations => this._mirrorLightItemContent(mutations),
    });
  }

  // Only `active` is copied: the drawn items also carry classes of the navbar's own, such as last-visible
  private _mirrorLightItemActive(mutations: MutationRecord[]) {
    for (const {target} of mutations) {
      const clone = this._lightDomClones.get(target as HTMLElement);
      clone?.classList.toggle('active', (target as HTMLElement).classList.contains('active'));
    }
  }

  // Redrawn in the same clone, so relabelling a tab, such as ahead of a page reload, resizes it under the indicator
  private _mirrorLightItemContent(mutations: MutationRecord[]) {
    const changed = new Set<HTMLElement>();
    for (const {target} of mutations) {
      const item = target === this ? null : (target instanceof Element ? target : target.parentElement)?.closest('li');
      if (item?.parentElement === this) {
        changed.add(item);
      }
    }
    changed.forEach(item => this._lightDomClones.get(item)
      ?.replaceChildren(...Array.from(item.cloneNode(true).childNodes)));
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

    let active = this.stacked || this.iconBar ? null : this._navItems?.querySelector<HTMLElement>(
      ':scope > li.active:not(.navbar__more), :scope > li.zn-tb-active');
    // A collapsed active tab is marked on the More item instead
    const collapsedActive = Boolean(active?.classList.contains('navbar__item--overflow'));
    this._more?.classList.toggle('active', collapsedActive);
    if (collapsedActive) {
      active = this._more;
    }
    const tab = active?.getBoundingClientRect();
    if (!tab || tab.width === 0) {
      indicator.classList.toggle('navbar__indicator--shown', false);
      this._indicatorTarget = null;
      return;
    }

    // Placed in the strip's content coordinates
    const box = container.getBoundingClientRect();
    // An ancestor mid scale-in (e.g. a modal opening) shrinks every rect, and its end fires no resize to re-measure
    const scaleX = box.width / container.offsetWidth || 1;
    const scaleY = box.height / container.offsetHeight || 1;
    const toStrip = (x: number) => (x - box.left) / scaleX + container.scrollLeft;
    const target = {left: toStrip(tab.left), right: toStrip(tab.right)};
    const previous = this._indicatorTarget;
    const tabChanged = active !== this._indicatorTab;
    const ready = indicator.classList.contains('navbar__indicator--ready');
    this._indicatorTab = active ?? null;
    // Exposed for ::part(indicator) styles that fill the tab rather than underline it.
    setStyle(indicator, '--zn-navbar-indicator-top', `${(tab.top - box.top) / scaleY}px`);
    setStyle(indicator, '--zn-navbar-indicator-height', `${tab.height / scaleY}px`);
    indicator.classList.toggle('navbar__indicator--shown', true);
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
      // A tab that shrank as the pill left it leaves the drawn pill past the tabs, where it would overflow the strip
      const end = toStrip(this._navItems!.getBoundingClientRect().right);
      slideTabIndicator(indicator, {left: Math.min(toStrip(drawn.left), end), right: Math.min(toStrip(drawn.right), end)}, target);
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
    this._scheduleCount();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._countObserver?.disconnect();
    this._countObserver = null;
    this._countRoots = [];
    if (this._countFrame !== null) cancelAnimationFrame(this._countFrame);
    this._countFrame = null;
  }

  // A `count` selector searches the closest zn-settings-container, the content these tabs filter, or else this
  // navbar's root. The walk steps out of shadow roots, so a navbar inside another component's shadow DOM finds it.
  private _countScope(): Element | Document | ShadowRoot {
    let node: Node | null = this.parentNode;
    while (node) {
      if (node instanceof Element && node.localName === 'zn-settings-container') return node;
      node = node instanceof ShadowRoot ? node.host : node.parentNode;
    }
    return this.getRootNode() as Document | ShadowRoot;
  }

  // Elements this navbar renders itself, at any shadow depth, are never counted or observed.
  private _isOwn(node: Node): boolean {
    for (let root = node.getRootNode(); root instanceof ShadowRoot; root = root.host.getRootNode()) {
      if (root.host === this) return true;
    }
    return false;
  }

  private _scheduleCount = () => {
    if (this._countFrame !== null || !this.isConnected) return;
    this._countFrame = requestAnimationFrame(() => {
      this._countFrame = null;
      this._updateCounts();
    });
  };

  private _updateCounts() {
    const given: (number | undefined)[] = (this.navigation ?? []).map(item =>
      typeof item?.count === 'number' && Number.isFinite(item.count) ? item.count : undefined);
    const selectors: (string | undefined)[] = (this.navigation ?? []).map(item =>
      typeof item?.count === 'string' && item.count.trim() ? item.count : undefined);
    if (!selectors.some(Boolean)) {
      this._countObserver?.disconnect();
      this._countObserver = null;
      this._countRoots = [];
      if (given.some(count => count !== undefined) || this._counts.length) {
        this._setCounts(given);
      }
      return;
    }

    const scope = this._countScope();
    const counts = selectors.map((selector, index) => {
      if (given[index] !== undefined) return given[index];
      if (!selector) return undefined;
      try {
        return deepQueryAll(selector, scope).filter(el => !this._isOwn(el)).length;
      } catch {
        // An invalid selector shows no badge rather than breaking the navbar.
        return undefined;
      }
    });
    this._setCounts(counts);

    // A MutationObserver stops at shadow boundaries, so each open shadow root in scope is observed as well.
    const roots: Node[] = [scope, ...deepQueryAll('*', scope)
      .filter(el => el.shadowRoot && el !== this && !this._isOwn(el))
      .map(el => el.shadowRoot!)];
    if (this._countObserver && roots.length === this._countRoots.length && roots.every((root, i) => root === this._countRoots[i])) {
      return;
    }
    this._countObserver?.disconnect();
    this._countObserver = new MutationObserver(records => {
      if (records.some(record => !this._isOwn(record.target) && record.target !== this)) this._scheduleCount();
    });
    for (const root of roots) {
      this._countObserver.observe(root, {childList: true, subtree: true, attributes: true, characterData: true});
    }
    this._countRoots = roots;
  }

  private _setCounts(counts: (number | undefined)[]) {
    if (counts.length !== this._counts.length || counts.some((count, i) => count !== this._counts[i])) {
      this._counts = counts;
    }
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
    const items = this._navItems?.querySelectorAll(':scope > li:not(#dropdown-item):not(.navbar__more)') || [];
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
      const shown = item.classList.contains('navbar__more')
        ? item.classList.contains('navbar__more--shown')
        : !item.classList.contains('navbar__item--overflow');
      if (item.id !== 'dropdown-item' && shown) {
        lastVisibleItem = item;
      }
    }

    // toggle with force leaves an unchanged class alone; remove-then-add would wake _activeObserver every resize
    items.forEach(item => item.classList.toggle('last-visible', item === lastVisibleItem));
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

    // An open fill panel overlays the strip, so the tabs give way to it and collapse into More instead
    const availableContainerWidth = this._resolveAvailableWidth();
    const expandWidth = this._getExpandableWidth(availableContainerWidth);
    const fillOpen = this._expanding.some(action => action.getAttribute('method') === 'fill' && action.hasAttribute('open'));
    setStyle(this._strip, 'max-width', fillOpen ? `${Math.max(availableContainerWidth - expandWidth, NAVBAR_MIN_WIDTH)}px` : '');

    this._collapseOverflow();
    this._syncLastVisibleItem();
  }

  /** Moves the tabs that don't fit the strip into the More menu, from the first that overflows onwards. */
  private _collapseOverflow() {
    const strip = this._strip;
    const list = this._navItems;
    const more = this._more;
    if (!strip || !list || !more) {
      return;
    }

    // Measured with every tab drawn and More shown, so the result doesn't depend on the last pass
    const items = Array.from(list.querySelectorAll<HTMLElement>(':scope > li'))
      .filter(item => item !== more && item.id !== 'dropdown-item');
    items.forEach(item => item.classList.remove('navbar__item--overflow'));
    more.classList.add('navbar__more--shown');

    // Rects keep the comparison right while an ancestor is mid scale-in
    const stripBox = strip.getBoundingClientRect();
    const scale = stripBox.width / strip.offsetWidth || 1;
    const stripStyle = getComputedStyle(strip);
    const listStyle = getComputedStyle(list);
    const gap = (parseFloat(listStyle.columnGap) || 0) * scale;
    const end = stripBox.right - scale * ((parseFloat(stripStyle.paddingRight) || 0)
      + (parseFloat(listStyle.marginRight) || 0) + (parseFloat(listStyle.paddingRight) || 0));
    const moreBox = more.getBoundingClientRect();
    if (moreBox.left - gap <= end + 0.5) {
      more.classList.remove('navbar__more--shown');
      return;
    }

    const add = list.querySelector<HTMLElement>(':scope > #dropdown-item');
    const limit = end - moreBox.width - gap - (add ? add.getBoundingClientRect().width + gap : 0);
    let overflowing = false;
    for (const item of items) {
      overflowing ||= item.getBoundingClientRect().right > limit + 0.5;
      item.classList.toggle('navbar__item--overflow', overflowing);
    }
  }

  /** Fills the More menu from the collapsed tabs as it opens, so labels, counts and the active tab are current. */
  private _fillMoreMenu = (e: Event) => {
    const dropdown = e.currentTarget as ZnDropdown;
    const menu = this._more?.querySelector('zn-menu');
    if (e.target !== dropdown || !menu || !this._navItems) {
      return;
    }

    const collapsed = this._navItems.querySelectorAll<HTMLElement>(':scope > li.navbar__item--overflow');
    menu.replaceChildren(...Array.from(collapsed, item => {
      const body = (item.querySelector('.navbar__body') ?? item).cloneNode(true) as HTMLElement;
      const count = body.querySelector('.navbar__count');
      count?.remove();
      const entry = document.createElement('zn-menu-item');
      // shortcut: label text only, a tab's icon isn't carried into the menu; add it if icon tabs overflow in practice
      entry.textContent = body.textContent?.trim() || item.querySelector('zn-tooltip')?.getAttribute('content') || '';
      if (count?.textContent) {
        entry.setAttribute('count', count.textContent.trim());
      }
      entry.setAttribute('type', 'checkbox');
      entry.setAttribute('checked-position', 'right');
      entry.toggleAttribute('checked', item.classList.contains('active') || item.classList.contains('zn-tb-active'));
      entry.addEventListener('click', () => {
        item.click();
        dropdown.hide();
      });
      return entry;
    }));
  };

  private _openMore = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      (e.currentTarget as HTMLElement).querySelector<HTMLElement>('.navbar__more-trigger')?.click();
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

    ul?.insertBefore(item, dropdown ?? this._more);

    this._updateVisibility();
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);

    this._expandable = this.shadowRoot?.querySelector<HTMLElement>('.navbar__container > div.expandables') ?? null;
    if (this._expandable) {
      const computed = getComputedStyle(this._expandable);
      this._expandableMargin = (parseFloat(computed.marginLeft) || 0) + (parseFloat(computed.marginRight) || 0);
      this._resizeController.observe(this._expandable);
    }
    this._navItems = this.shadowRoot?.querySelector<HTMLElement>('ul.navbar') ?? null;
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
    this._more = this.shadowRoot?.querySelector<HTMLElement>('ul.navbar > li.navbar__more') ?? null;
    if (this._strip) {
      this._resizeController.observe(this._strip);
    }
    this._indicator = this.shadowRoot?.querySelector<HTMLElement>('.navbar__indicator') ?? null;
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

    this._scheduleResize();

    if (this.dropdown.length > 0) {
      const menu = this.shadowRoot?.querySelector('#dropdown-item zn-menu');
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

  // Isolated tabs have no zn-tabs to give them keys, so they take the same ones: Enter or Space selects, arrows move
  private handleKeyDown = (e: KeyboardEvent) => {
    const tabs = [...this.shadowRoot!.querySelectorAll<HTMLElement>('li[data-tab]')].filter(li => li.offsetParent !== null);
    const tab = e.composedPath().find(el => tabs.includes(el as HTMLElement)) as HTMLElement | undefined;
    if (!tab) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      tab.click();
      return;
    }
    const index = tabs.indexOf(tab);
    const target = {ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1}[e.key];
    if (target === undefined) return;
    e.preventDefault();
    tabs[(target + tabs.length) % tabs.length].focus();
  };

  protected updated(_changedProperties: PropertyValues) {
    super.updated(_changedProperties);
    if (_changedProperties.has('hideOne') || _changedProperties.has('navigation') || _changedProperties.has('_appended')) {
      this._updateVisibility();
    }
    if (_changedProperties.has('navigation')) {
      this._scheduleCount();
    }
  }

  render() {
    if (!this.navigation) {
      this.navigation = [];
    }
    const indicator = html`<span class="navbar__indicator" part="indicator" aria-hidden="true"></span>`;
    const list = html`
      <ul @click="${this.handleClick}"
          @keydown="${ifDefined(this.isolated ? this.handleKeyDown : undefined)}"
          role="${ifDefined(this.isolated ? 'tablist' : undefined)}"
          part="navbar" class="${classMap({
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
        ${this.navigation.map((item, index) => {
          let content = html`${item.title}`;
          const count = this._counts[index];
          const showCount = count !== undefined && (count > 0 || this.showZeroCounts);
          if (showCount) {
            // One inline run, so the count sits in the title's text flow rather than a tab's flex gap.
            const countClasses = classMap({
              'navbar__count': true,
              'navbar__count--zero': count === 0,
              [`navbar__count--${item.countColor}`]: Boolean(item.countColor) && count > 0,
            });
            content = html`<span>${content}<span class="${countClasses}" part="count">${count}</span></span>`;
          }
          if (item.icon) {
            content = html`
              <zn-icon src="${item.icon}"
                       size="${item.iconSize || 20}"
                       color="${ifDefined(item.iconColor || undefined)}"></zn-icon>${content}`;
          }
          content = html`<span class="navbar__body" part="navbar-item-body">${content}</span>`;
          if (item.label) {
            content = html`
              <zn-tooltip content="${showCount ? `${item.label} · ${count}` : item.label}" placement="bottom">
                <span class="navbar__tip">${content}</span>
              </zn-tooltip>`;
          }
          const itemClasses = classMap({'active': Boolean(item.active), 'navbar__item--tip': Boolean(item.label)});
          if (item.path !== undefined && item.path !== null) {
            return html`
              <li class="${itemClasses}"
                  part="navbar-item"
                  tab-uri="${item.path}">${content}
              </li>`;
          }
          if (this.isolated) {
            // One stop in the tab order: the active tab, or the first while none is
            const focusable = item.active || (index === 0 && !this.navigation.some(nav => nav.active));
            return html`
              <li class="${itemClasses}"
                  part="navbar-item"
                  data-tab="${ifDefined(item.tab)}"
                  role="tab"
                  tabindex="${focusable ? 0 : -1}"
                  aria-selected="${item.active ? 'true' : 'false'}"
                  aria-label="${ifDefined(item.label ? (showCount ? `${item.label}, ${count}` : item.label) : undefined)}">
                ${content}
              </li>`;
          }
          return html`
            <li class="${itemClasses}"
                part="navbar-item"
                tab="${ifDefined(item.tab)}">
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
        <!-- "more" is the earlier More item's class, which callers still skip with li:not(.more) -->
        <li class="navbar__more more" part="navbar-more" @click="${this._openMore}">
          <zn-dropdown placement="bottom-end" @zn-show="${this._fillMoreMenu}">
            <button slot="trigger" type="button" class="navbar__more-trigger" aria-haspopup="menu">
              More<zn-icon src="chevron-down@lu" size="16"></zn-icon>
            </button>
            <zn-menu></zn-menu>
          </zn-dropdown>
        </li>
      </ul>`;

    return html`
      <div part="container" class="${classMap({
        'navbar__container': true,
        'navbar__container--stacked': this.stacked,
        'navbar__container--icon-bar': this.iconBar
      })}">
        ${this.stacked || this.iconBar ? html`${list}${indicator}` : html`
          <div class="navbar__strip">
            ${list}
            ${indicator}
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
