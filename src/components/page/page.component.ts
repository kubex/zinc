import {classMap} from 'lit/directives/class-map.js';
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {HasSlotController} from '../../internal/slot';
import {property, state} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import ZnNavbar from '../navbar';
import ZnTab from '../tab';
import ZnTabs from '../tabs';

import styles from './page.scss';

interface TabDefinition {
  id: string;
  caption: string;
  uri: string | null;
  panel: HTMLElement | null;
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
  @property() summary: string;

  @state() private tabDefinitions: TabDefinition[] = [];

  connectedCallback() {
    super.connectedCallback();
    this.prepareTabs();
  }

  private prepareTabs() {
    const tabs: TabDefinition[] = [];
    const usedIds = new Set<string>();
    const tabElements = Array.from(this.children).filter((node): node is HTMLElement => node.tagName === 'ZN-TAB');

    for (const tab of tabElements) {
      const caption = tab.getAttribute('caption') || 'Tab';
      const explicitId = tab.getAttribute('id');
      const id = this.uniqueId(explicitId || this.captionToId(caption), usedIds);
      const uri = tab.getAttribute('uri');

      if (!uri) {
        tab.id = id;
      }

      tabs.push({
        id,
        caption,
        uri,
        panel: uri ? null : tab
      });
    }

    this.tabDefinitions = tabs;
  }

  private captionToId(caption: string): string {
    if (caption.trim().toLowerCase() === 'overview') {
      return '';
    }

    const id = caption
      .trim()
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

  render() {
    const hasBreadcrumb = this.hasSlotController.test('breadcrumb');

    return html`
      <div class="page" part="base">
        <div class="${classMap({
          'header': true,
          'header--has-breadcrumb': hasBreadcrumb
        })}" part="header">
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

        <zn-tabs>
          <zn-navbar slot="top" hide-one>
            ${this.tabDefinitions.map(tab => tab.uri ? html`
              <li tab-uri="${tab.uri}">${tab.caption}</li>
            ` : html`
              <li tab="${tab.id}">${tab.caption}</li>
            `)}
          </zn-navbar>

          ${this.tabDefinitions.map(tab => tab.panel)}
        </zn-tabs>
      </div>
    `;
  }
}
