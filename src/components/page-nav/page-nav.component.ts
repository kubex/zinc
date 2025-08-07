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
  icon: string;
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
    if (navigationElement) {
      // Toggle the 'active' class to show/hide the navigation
      navigationElement.classList.toggle('active');
    }
    // toggle menu overlay
    const menuOverlay = this.shadowRoot?.querySelector('.menu-overlay');
    if (menuOverlay) {
      menuOverlay.classList.toggle('active');
    }
  }

  setActiveTab(tabName: string, store: boolean, refresh: boolean, refTab: string | null = null) {
    super.setActiveTab(tabName, store, refresh, refTab);

    const firstTab = this.shadowRoot?.querySelector('.navigation-item.active');
    if (firstTab) {
      this.breadcrumb = firstTab.textContent?.trim() || '';
    } else {
      this.breadcrumb = '';
    }
  }

  clickTab(target: HTMLElement, refresh: boolean) {
    super.clickTab(target, refresh);
    this.breadcrumb = target.textContent?.trim() || '';
    this.toggleNavigation();
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
              <zn-icon src="${item.icon}" size="24"></zn-icon>
              ${item.label}
            </div>
          `)}
        </div>
      `;
    });

    return html`
      <div class="breadcrumb">
        <div @click="${this.toggleNavigation}" class="breadcrumb-menu-toggle">
          <zn-icon src="menu" size="24"></zn-icon>
          <span>${this.breadcrumb}</span>
        </div>
      </div>
      <div class="tabs">
        <div class="navigation">
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
