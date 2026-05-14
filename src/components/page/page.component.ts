import {classMap} from 'lit/directives/class-map.js';
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {HasSlotController} from '../../internal/slot';
import {property, state} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import ZnButton from '../button';
import ZnCopyButton from '../copy-button';
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
}

/**
 * @summary Combines a page header with tab navigation and tab panels.
 * @documentation https://zinc.style/components/page
 * @status experimental
 * @since 1.0
 *
 * @slot - Page content. Use zn-tab for named tabs and header-action/header-actions for header actions.
 */
export default class ZnPage extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-button': ZnButton,
    'zn-copy-button': ZnCopyButton,
    'zn-icon': ZnIcon,
    'zn-navbar': ZnNavbar,
    'zn-tab': ZnTab,
    'zn-tabs': ZnTabs
  };

  private readonly hasSlotController = new HasSlotController(this, 'breadcrumb', 'actions', 'caption');

  @property() caption: string;
  @property({attribute: 'entity-id'}) entityId: string;
  @property({attribute: 'entity-id-show', type: Boolean}) entityIdShow: boolean;
  @property({attribute: 'full-location'}) fullLocation: string;
  @property({type: Boolean, reflect: true}) modal = false;
  @property({type: Boolean, reflect: true}) nested = false;
  @property({attribute: 'previous-path'}) previousPath: string;
  @property({attribute: 'previous-target'}) previousTarget: string;
  @property() summary: string;

  @state() private scrolled = false;
  @state() private tabDefinitions: TabDefinition[] = [];
  private tabObserver: MutationObserver | null = null;

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('alt-press', this.handleAltPress);
    window.addEventListener('alt-up', this.handleAltUp);
    this.prepareTabs();
    this.tabObserver = new MutationObserver((mutations) => {
      if (mutations.some(mutation => mutation.type === 'childList')) {
        this.prepareTabs();
      }
    });
    this.tabObserver.observe(this, {childList: true});
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('alt-press', this.handleAltPress);
    window.removeEventListener('alt-up', this.handleAltUp);
    this.tabObserver?.disconnect();
    this.tabObserver = null;
  }

  private handleAltPress = () => {
    this.classList.toggle('alt-pressed', true);
  };

  private handleAltUp = () => {
    this.classList.toggle('alt-pressed', false);
  };

  protected firstUpdated() {
    setTimeout(() => this.activateInitialTab(), 20);
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

      if (!uri) {
        tab.id = id;
        tab.slot = slotName!;
      }

      tabs.push({id, caption, priority, sourceIndex: index, uri, slotName});
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

  private activateInitialTab() {
    const firstTab = this.tabDefinitions[0];
    if (firstTab) {
      this.activateTab(firstTab.id, false);
    }
  }

  private handleNavigationSelect(event: ZnSelectEvent) {
    const item = event.detail.item as HTMLElement;
    const tabUri = item.getAttribute('tab-uri');
    const tabId = item.getAttribute('tab');
    const tabs = this.shadowRoot?.querySelector('zn-tabs') as ZnTabs | null;

    if (!tabs) {
      return;
    }

    if (tabUri) {
      tabs.clickTab(item, false);
      this.syncNavigationActive(item);
      return;
    }

    if (tabId !== null) {
      this.activateTab(tabId, true);
    }
  }

  private activateTab(tabId: string, store: boolean) {
    const tabs = this.shadowRoot?.querySelector('zn-tabs') as ZnTabs | null;
    if (!tabs) {
      return;
    }

    tabs.setActiveTab(tabId, store, false);
    const navItem = this.shadowRoot?.querySelector<HTMLElement>(`zn-navbar li[tab="${CSS.escape(tabId)}"]`);
    if (navItem) {
      this.syncNavigationActive(navItem);
    }
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
    const hasBreadcrumb = this.hasSlotController.test('breadcrumb');
    const hasNavigation = this.tabDefinitions.length > 1;
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
                  <zn-copy-button copy-label="Copy Entity ID" value="${this.entityId}" src="fingerprint"></zn-copy-button>`
                  : null}
                ${hasFullLocation ? html`
                  <zn-copy-button copy-label="Copy Full Location" value="${this.fullLocation}" src="link"></zn-copy-button>`
                  : null}
              </div>` : null}

            <div class="content" part="content">
              ${hasPreviousPath ? html`
                <a href="${this.previousPath}" class="caption__back"
                   data-target="${this.previousTarget ? this.previousTarget : ''}">
                  <zn-button size="content" icon="arrow_back" icon-size="24" color="transparent"></zn-button>
                </a>` : null}

              <div class="caption">
                <div part="header-left" class="header__left">
                  <span class="header__caption" part="header-caption">
                    ${hasBreadcrumb ? html`
                      <slot name="breadcrumb" class="breadcrumb"></slot>` : null}
                    <slot name="caption">${this.caption}</slot>
                  </span>
                  ${this.summary ? html`
                      <span class="header__description" part="header-description">${this.summary}</span>`
                    : null}
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
            </zn-navbar>
          ` : null}
        </div>

        <div class="page__tabs">
          <zn-tabs flush>
            ${this.tabDefinitions
              .filter(tab => tab.slotName !== null)
              .map(tab => html`
                <div id="${tab.id}">
                  <slot name="${tab.slotName!}"></slot>
                </div>
              `)}
          </zn-tabs>
        </div>
      </div>
    `;
  }
}
