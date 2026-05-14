import {classMap} from 'lit/directives/class-map.js';
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {HasSlotController} from '../../internal/slot';
import {property, state} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import ZnNavbar from '../navbar';
import ZnTab from '../tab';
import ZnTabs from '../tabs';
import type {ZnSelectEvent} from '../../events/zn-select';

import styles from './page.scss';

interface TabDefinition {
  id: string;
  caption: string;
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
    'zn-navbar': ZnNavbar,
    'zn-tab': ZnTab,
    'zn-tabs': ZnTabs
  };

  private readonly hasSlotController = new HasSlotController(this, 'breadcrumb', 'actions', 'caption');

  @property() caption: string;
  @property({type: Boolean, reflect: true}) modal = false;
  @property({type: Boolean, reflect: true}) nested = false;
  @property() summary: string;

  @state() private scrolled = false;
  @state() private tabDefinitions: TabDefinition[] = [];

  connectedCallback() {
    super.connectedCallback();
    this.prepareTabs();
  }

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
      const id = this.uniqueId(explicitId || this.captionToId(caption), usedIds);
      const uri = tab.getAttribute('uri');
      const slotName = uri ? null : `page-tab-${index}`;

      if (!uri) {
        tab.id = id;
        tab.slot = slotName!;
      }

      tabs.push({id, caption, uri, slotName});
    });

    this.tabDefinitions = tabs;
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
      nextId = `${id}-${count}`;
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

    return html`
      <div class="page" part="base" @scroll="${this.handlePageScroll}">
        <div class="${classMap({
          'page__header': true,
          'page__header--scrolled': this.scrolled
        })}" part="header">
          <div class="${classMap({
            'header': true,
            'header--has-breadcrumb': hasBreadcrumb,
            'header--has-navigation': hasNavigation
          })}">
            <div class="content" part="content">
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
