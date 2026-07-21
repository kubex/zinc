import {classMap} from 'lit/directives/class-map.js';
import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {HasSlotController} from '../../internal/slot';
import {property, state} from 'lit/decorators.js';
import ZnButton from '../button';
import ZnCopyButton from '../copy-button';
import ZnExpandingAction from '../expanding-action';
import ZnIcon from '../icon';
import ZnNavbar from '../navbar';
import ZnTab from '../tab';
import ZnTabs from '../tabs';
import type {ZnSelectEvent} from '../../events/zn-select';

import styles from './page.scss';

interface TabDefinition {
  id: string;
  caption: string;
  priority: number | null;
  sourceIndex: number;
  uri: string | null;
  slotName: string | null;
  selected: boolean;
}

const PAGE_TABS_HISTORY_KEY = '__znPageTabs';

interface PageTabsHistoryState {
  [PAGE_TABS_HISTORY_KEY]?: Record<string, string>;
}

/**
 * @summary Combines a page header with tab navigation and tab panels.
 * @documentation https://zinc.style/components/page
 * @status experimental
 * @since 1.0
 *
 * @slot - Page content. Use zn-tab for named tabs and header-action/header-actions for header actions.
 * @slot description - Rich subtitle/description content. Falls back to the `summary` attribute when empty.
 * @slot bottom - Content rendered below the navbar row (e.g. chips, filters). Forwarded to the navbar's bottom slot.
 */
export default class ZnPage extends ZnTabs {
  static styles: CSSResultGroup = [ZnTabs.styles, unsafeCSS(styles)];
  static dependencies = {
    'zn-button': ZnButton,
    'zn-copy-button': ZnCopyButton,
    'zn-expanding-action': ZnExpandingAction,
    'zn-icon': ZnIcon,
    'zn-navbar': ZnNavbar,
    'zn-tab': ZnTab
  };

  private readonly pageSlotController = new HasSlotController(this, 'breadcrumb', 'actions', 'caption');

  @property() caption: string;
  @property({attribute: 'entity-id'}) entityId: string;
  @property({attribute: 'entity-id-show', type: Boolean}) entityIdShow: boolean;
  @property({attribute: 'full-location'}) fullLocation: string;
  @property({type: Boolean, reflect: true}) modal = false;
  @property({type: Boolean, reflect: true}) nested = false;
  @property({type: Boolean, reflect: true}) primary = false; // margin
  @property({attribute: 'previous-path'}) previousPath: string;
  @property({attribute: 'previous-target'}) previousTarget: string;
  @property() summary: string;

  @state() private scrolled = false;
  @state() private tabDefinitions: TabDefinition[] = [];
  @state() private hasExpandingActions = false;
  private actionObserver: MutationObserver | null = null;
  private tabObserver: MutationObserver | null = null;
  private pageHistoryKey: string | null = null;

  async connectedCallback() {
    const connected = super.connectedCallback();
    window.addEventListener('alt-press', this.handleAltPress);
    window.addEventListener('alt-up', this.handleAltUp);
    this.prepareTabs();
    this.refreshExpandingActionsState();
    this.tabObserver = new MutationObserver((mutations) => {
      if (mutations.some(mutation => mutation.type === 'childList')) {
        this.prepareTabs();
      }
    });
    this.tabObserver.observe(this, {childList: true});
    this.actionObserver = new MutationObserver((mutations) => {
      if (mutations.some(mutation => mutation.type === 'childList')) {
        this.refreshExpandingActionsState();
        this.syncExpandingActionsToNavbar();
      }
    });
    this.actionObserver.observe(this, {childList: true, subtree: true});
    await connected;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('alt-press', this.handleAltPress);
    window.removeEventListener('alt-up', this.handleAltUp);
    this.tabObserver?.disconnect();
    this.tabObserver = null;
    this.actionObserver?.disconnect();
    this.actionObserver = null;
  }

  private handleAltPress = () => {
    this.classList.toggle('alt-pressed', true);
  };

  private handleAltUp = () => {
    this.classList.toggle('alt-pressed', false);
  };

  // Inject a real chevron icon between breadcrumb links (idempotent: only mutates when needed)
  private handleBreadcrumbSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    const assigned = slot.assignedElements();
    const anchors = assigned.filter(el => el.tagName === 'A');

    // Remove separators that are no longer between two links
    assigned.forEach(el => {
      if (!el.hasAttribute('data-breadcrumb-separator')) return;
      const prev = el.previousElementSibling;
      const valid = prev?.tagName === 'A' && anchors.indexOf(prev) < anchors.length - 1;
      if (!valid) el.remove();
    });

    // Ensure each link except the last is followed by a separator icon
    anchors.forEach((anchor, index) => {
      if (index === anchors.length - 1) return;
      const next = anchor.nextElementSibling;
      if (next?.hasAttribute('data-breadcrumb-separator')) return;

      const icon = document.createElement('zn-icon');
      icon.setAttribute('src', 'arrow-right@lu');
      icon.setAttribute('size', '16');
      icon.setAttribute('slot', 'breadcrumb');
      icon.setAttribute('data-breadcrumb-separator', '');
      anchor.after(icon);
    });
  };

  _registerTabs = () => {
    this.registerPageNavigationTabs();
  };

  firstUpdated(changedProperties: PropertyValues) {
    super.firstUpdated(changedProperties);
    this.registerPagePanels();
    this.syncExpandingActionsToNavbar();
    setTimeout(() => this.activateInitialPageTab(), 20);
  }

  private getOwnExpandingActions() {
    return Array.from(this.querySelectorAll<ZnExpandingAction>('zn-expanding-action'))
      .filter(action => action.closest('zn-page') === this);
  }

  private getNavbar() {
    return this.shadowRoot?.querySelector<ZnNavbar>('zn-navbar') || null;
  }

  private refreshExpandingActionsState() {
    const navbar = this.getNavbar();
    const hasNavbarActions = Boolean(
      navbar?.querySelector('zn-expanding-action') ||
      navbar?.shadowRoot?.querySelector('zn-expanding-action')
    );
    const hasExpandingActions = this.getOwnExpandingActions().length > 0 || hasNavbarActions;

    if (this.hasExpandingActions !== hasExpandingActions) {
      this.hasExpandingActions = hasExpandingActions;
    }
  }

  private syncExpandingActionsToNavbar() {
    const navbar = this.getNavbar();
    if (!navbar) {
      return;
    }

    this.getOwnExpandingActions().forEach(action => navbar.addExpandingAction(action));
    this.refreshExpandingActionsState();
  }

  private prepareTabs() {
    const tabs: TabDefinition[] = [];
    const usedIds = new Set<string>();
    const tabElements = Array.from(this.children).filter((node): node is HTMLElement => node.tagName === 'ZN-TAB');

    tabElements.forEach((tab, index) => {
      const caption = tab.getAttribute('caption') || 'Tab';
      const explicitId = tab.getAttribute('id');
      const id = this.uniqueId(explicitId !== null ? explicitId : this.captionToId(caption), usedIds);
      const priority = this.parsePriority(tab.getAttribute('priority'));
      const uri = tab.getAttribute('uri');
      const slotName = uri ? null : `page-tab-${index}`;
      const selected = tab.hasAttribute('selected');

      tab.id = id;

      if (!uri) {
        tab.slot = slotName!;
      }

      tabs.push({id, caption, priority, sourceIndex: index, uri, slotName, selected});
    });

    this.tabDefinitions = tabs.sort((a, b) => this.compareTabs(a, b));
  }

  private parsePriority(value: string | null): number | null {
    if (value === null || value.trim() === '') {
      return null;
    }

    const priority = Number(value);
    return Number.isFinite(priority) ? priority : null;
  }

  private compareTabs(a: TabDefinition, b: TabDefinition): number {
    if (a.id === '' && b.id !== '') {
      return -1;
    }

    if (a.id !== '' && b.id === '') {
      return 1;
    }

    if (a.priority !== null && b.priority !== null && a.priority !== b.priority) {
      return a.priority - b.priority;
    }

    if (a.priority !== null && b.priority === null) {
      return -1;
    }

    if (a.priority === null && b.priority !== null) {
      return 1;
    }

    return a.sourceIndex - b.sourceIndex;
  }

  private captionToId(caption: string): string {
    if (caption.trim().toLowerCase() === 'overview') {
      return '';
    }

    const id = caption.trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return id || 'tab';
  }

  private uniqueId(id: string, usedIds: Set<string>): string {
    let nextId = id;
    let count = 2;

    while (usedIds.has(nextId)) {
      nextId = id === '' ? `tab-${count}` : `${id}-${count}`;
      count += 1;
    }

    usedIds.add(nextId);
    return nextId;
  }

  private handlePageScroll(event: Event) {
    const scrolled = (event.currentTarget as HTMLElement).scrollTop > 24;
    if (this.scrolled !== scrolled) {
      this.scrolled = scrolled;
    }
  }

  updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has('tabDefinitions')) {
      this.registerPagePanels();
    }

    if (changedProperties.has('tabDefinitions') || changedProperties.has('hasExpandingActions')) {
      this.syncExpandingActionsToNavbar();
    }
  }

  private handleNavigationSelect(event: ZnSelectEvent) {
    const item = event.detail.item as HTMLElement;
    if (this.getNavigationItemPage(item) !== this) {
      return;
    }

    const tabUri = item.getAttribute('tab-uri');
    const tabId = item.getAttribute('tab');

    if (tabUri) {
      this.clickTab(item, false);
      this.syncNavigationActive(item);
      this.persistActivePageTab(tabUri);
      return;
    }

    if (tabId !== null) {
      this.activateTab(tabId, true);
    }
  }

  private getNavigationItemPage(item: HTMLElement): ZnPage | null {
    let current: Node | null = item;

    while (current) {
      if (current instanceof ZnPage) {
        return current;
      }

      const root = current.getRootNode();
      if (!(root instanceof ShadowRoot)) {
        return item.closest<ZnPage>('zn-page');
      }

      current = root.host;
    }

    return null;
  }

  private activateTab(tabId: string, store: boolean) {
    this.setActiveTab(tabId, store, false);
    if (store) {
      this.persistActivePageTab(tabId);
    }
    const navItem = this.shadowRoot?.querySelector<HTMLElement>(`zn-navbar li[tab="${CSS.escape(tabId)}"]`);
    if (navItem) {
      this.syncNavigationActive(navItem);
    }
  }

  private activateInitialPageTab() {
    const restoredTab = this.getPersistedPageTab();
    if (restoredTab !== null) {
      const definition = this.tabDefinitions.find(tab => tab.id === restoredTab || tab.uri === restoredTab);
      if (definition) {
        this.activateTabDefinition(definition);
        return;
      }
    }

    const preselected = this.tabDefinitions.find(tab => tab.selected);
    if (preselected) {
      this.activateTabDefinition(preselected);
      return;
    }

    const selectedPanel = this.shadowRoot?.querySelector('#content > div[selected]');
    const firstTab = this.tabDefinitions[0];

    if (!selectedPanel && firstTab) {
      this.activateTab(firstTab.id, false);
    }
  }

  private getPageHistoryKey(): string {
    if (this.pageHistoryKey !== null) {
      return this.pageHistoryKey;
    }

    const pages: ZnPage[] = [this];
    let ancestor = this.parentElement?.closest<ZnPage>('zn-page') ?? null;
    while (ancestor) {
      pages.unshift(ancestor);
      ancestor = ancestor.parentElement?.closest<ZnPage>('zn-page') ?? null;
    }

    this.pageHistoryKey = pages
      .map(page => page.id || page.getAttribute('caption') || 'page')
      .join('/');
    return this.pageHistoryKey;
  }

  private getPersistedPageTab(): string | null {
    const historyState = window.history.state as unknown;
    if (historyState === null || typeof historyState !== 'object') {
      return null;
    }

    const tab = (historyState as PageTabsHistoryState)[PAGE_TABS_HISTORY_KEY]?.[this.getPageHistoryKey()];
    return typeof tab === 'string' ? tab : null;
  }

  private persistActivePageTab(tab: string) {
    const currentHistoryState = window.history.state as unknown;
    const historyState = currentHistoryState !== null && typeof currentHistoryState === 'object'
      ? currentHistoryState as Record<string, unknown>
      : {};
    const storedPageTabs = historyState[PAGE_TABS_HISTORY_KEY];
    const pageTabs = storedPageTabs !== null && typeof storedPageTabs === 'object'
      ? storedPageTabs as Record<string, string>
      : {};

    window.history.replaceState({
      ...historyState,
      [PAGE_TABS_HISTORY_KEY]: {
        ...pageTabs,
        [this.getPageHistoryKey()]: tab
      }
    }, '');
  }

  private activateTabDefinition(tab: TabDefinition) {
    if (tab.uri) {
      const navItem = this.findNavItemForUri(tab.uri);
      if (navItem) {
        this.clickTab(navItem, false);
        this.syncNavigationActive(navItem);
        return;
      }
    }
    this.activateTab(tab.id, false);
  }

  private findNavItemForUri(uri: string): HTMLElement | null {
    const items = this.shadowRoot?.querySelectorAll<HTMLElement>('zn-navbar li[tab-uri]') ?? [];
    for (const item of Array.from(items)) {
      if (item.getAttribute('tab-uri') === uri) {
        return item;
      }
    }
    return null;
  }

  private registerPagePanels() {
    this.shadowRoot?.querySelectorAll<HTMLElement>('#content > div[id]').forEach(panel => {
      this._addPanel(panel);
    });
    this.registerPageNavigationTabs();
    setTimeout(() => this.registerPageNavigationTabs());
  }

  private registerPageNavigationTabs() {
    this.shadowRoot
      ?.querySelectorAll<HTMLElement>('zn-navbar li[tab], zn-navbar li[tab-uri]')
      .forEach(tab => this._addTab(tab));

    this.shadowRoot
      ?.querySelectorAll<ZnNavbar>('zn-navbar')
      .forEach(navbar => {
        navbar.shadowRoot
          ?.querySelectorAll<HTMLElement>('li[tab], li[tab-uri]')
          .forEach(tab => this._addTab(tab));
      });
  }

  private syncNavigationActive(activeItem: HTMLElement) {
    const navItems = this.shadowRoot?.querySelectorAll('zn-navbar li[tab], zn-navbar li[tab-uri]') || [];
    navItems.forEach(item => {
      const active = item === activeItem;
      item.classList.toggle('active', active);
      item.classList.toggle('zn-tb-active', active);
    });
  }

  render() {
    const hasBreadcrumb = !this.modal && !this.nested && this.pageSlotController.test('breadcrumb');
    const hasNavigation = this.tabDefinitions.length > 1 || this.hasExpandingActions;
    const hasEntityId = this.entityId;
    const hasFullLocation = this.fullLocation;
    const hasPreviousPath = this.previousPath;

    return html`
      <div class="page" part="base" @scroll="${this.handlePageScroll}">
        <div class="${classMap({
          'page__header': true,
          'page__header--scrolled-no-navigation': this.scrolled && !hasNavigation
        })}" part="header">
          <div class="${classMap({
            'header': true,
            'header--has-breadcrumb': hasBreadcrumb,
            'header--has-entity-id': hasEntityId,
            'header--has-full-location': hasFullLocation,
            'header--has-navigation': hasNavigation,
            'header--has-previous': hasPreviousPath
          })}">
            ${hasFullLocation || hasEntityId ? html`
              <div class="${classMap({
                'alt-overlay': true,
                'alt-overlay--visible': this.entityIdShow
              })}">
                ${hasFullLocation ? html`
                  <a href="${this.fullLocation}" target="_blank">
                    <zn-icon src="open_in_new"></zn-icon>
                  </a>` : null}
                ${hasEntityId ? html`
                    <zn-copy-button copy-label="Copy Entity ID" value="${this.entityId}"
                                    src="fingerprint"></zn-copy-button>`
                  : null}
                ${hasFullLocation ? html`
                    <zn-copy-button copy-label="Copy Full Location" value="${this.fullLocation}"
                                    src="link"></zn-copy-button>`
                  : null}
              </div>` : null}

            <div class="content">
              ${hasPreviousPath ? html`
                <a href="${this.previousPath}" class="caption__back"
                   data-target="${this.previousTarget ? this.previousTarget : ''}">
                  <zn-button icon="arrow-left@lu" icon-size="24" icon-button="small" plain></zn-button>
                </a>` : null}

              <div class="caption">
                <div class="header__left">
                  <span class="header__caption">
                    ${hasBreadcrumb ? html`
                      <slot name="breadcrumb" class="breadcrumb"
                            @slotchange="${this.handleBreadcrumbSlotChange}"></slot>
                      <zn-icon class="breadcrumb__separator" src="arrow-right@lu" size="16"></zn-icon>` : null}
                    <slot name="caption">${this.caption}</slot>
                  </span>
                  <span class="header__description"><slot name="description">${this.summary}</slot></span>
                </div>

                <div class="header__right">
                  <slot name="actions"></slot>
                </div>
              </div>
            </div>
          </div>

          ${hasNavigation ? html`
            <zn-navbar hide-one @zn-select="${this.handleNavigationSelect}">
              ${this.tabDefinitions.map(tab => tab.uri ? html`
                <li tab-uri="${tab.uri}">${tab.caption}</li>
              ` : html`
                <li tab="${tab.id}">${tab.caption}</li>
              `)}
              <slot name="bottom" slot="bottom"></slot>
            </zn-navbar>
          ` : null}
        </div>

        <div class="page__tabs">
          <div id="content" class="page__content" part="content">
            ${this.tabDefinitions
              .filter(tab => tab.slotName !== null)
              .map(tab => html`
                <div id="${tab.id}" ?selected="${tab.selected}">
                  <slot name="${tab.slotName!}"></slot>
                </div>
              `)}
          </div>
        </div>
      </div>
    `;
  }
}
