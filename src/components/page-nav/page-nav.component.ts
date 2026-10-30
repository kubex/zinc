import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property, state} from 'lit/decorators.js';
import ZnTabs from "../tabs";

import styles from './page-nav.scss';

interface PageNavData {
  data: PageNavigation[];
}

interface PageNavigation {
  title: string;
  items: PageNavigationItem[];
}

interface PageNavigationItem {
  icon?: string;
  label: string;
  uri: string;
}

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/page-nav
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
export default class ZnPageNav extends ZnTabs {
  static styles: CSSResultGroup = [ZnTabs.styles, unsafeCSS(styles)];

  @property({type: Object}) navigation: PageNavData;

  @state() breadcrumb: string

  toggleNavigation() {
    const navigationElement = this.shadowRoot?.querySelector('.navigation');
    const toggle = this.shadowRoot?.querySelector<HTMLElement>('.breadcrumb-menu-toggle');
    if (navigationElement) {
      // Toggle the 'active' class to show/hide the navigation
      const open = navigationElement.classList.toggle('active');
      toggle?.setAttribute('aria-expanded', String(open));

      // The closed menu is hidden, so focus inside it would be lost. The toggle is only shown on narrow layouts.
      if (!open && navigationElement.contains(this.shadowRoot!.activeElement) && toggle?.checkVisibility()) {
        toggle.focus();
      }
    }
    // toggle menu overlay
    const menuOverlay = this.shadowRoot?.querySelector('.menu-overlay');
    if (menuOverlay) {
      menuOverlay.classList.toggle('active');
    }
  }

  private handleToggleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.toggleNavigation();
    }
  };

  private handleNavigationKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && (e.currentTarget as HTMLElement).classList.contains('active')) {
      e.stopPropagation();
      this.toggleNavigation();
    }
  };

  setActiveTab(tabName: string, store: boolean, refresh: boolean, refTab: string | null = null) {
    super.setActiveTab(tabName, store, refresh, refTab);

    const firstTab = this.shadowRoot?.querySelector('.navigation-item.active');
    if (firstTab) {
      this.breadcrumb = firstTab.textContent?.trim() || '';
    } else {
      this.breadcrumb = '';
    }
  }

  clickTab(target: HTMLElement, refresh: boolean, close = true) {
    super.clickTab(target, refresh);
    this.breadcrumb = target.textContent?.trim() || '';
    if(close) {
      this.toggleNavigation();
    }
  }

  render() {
    if (!this.navigation) {
      return html`<p>No navigation data available.</p>`;
    }

    const navItems = this.navigation.data.map(data => {
      return html`
        <div class="navigation-group">
          ${data.title ? html`<h4>${data.title}</h4>` : ''}
          ${data.items.map(item => html`
            <div tab-uri="${item.uri}" class="navigation-item">
              ${item.icon ? html`<zn-icon src="${item.icon}" size="24"></zn-icon>` : ''}
              ${item.label}
            </div>
          `)}
        </div>
      `;
    });

    return html`
      <div class="breadcrumb">
        <div @click="${this.toggleNavigation}" @keydown="${this.handleToggleKeyDown}" class="breadcrumb-menu-toggle"
             role="button" tabindex="0" aria-expanded="false">
          <zn-icon src="menu" size="24"></zn-icon>
          <span>${this.breadcrumb}</span>
        </div>
      </div>
      <div class="tabs">
        <div class="navigation" @keydown="${this.handleNavigationKeyDown}">
          ${navItems}
        </div>
        <div class="menu-overlay" @click="${this.toggleNavigation}"></div>
        <div id="mid" part="mid">
          <div id="content">
            <slot></slot>
          </div>
        </div>
      </div>
    `;
  }
}
