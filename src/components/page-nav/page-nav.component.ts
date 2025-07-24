import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property} from 'lit/decorators.js';
import ZnTabs from "../tabs";

import styles from './page-nav.scss';

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

  /** An example attribute. */
  @property({type: Object}) navigation: Record<string, Record<string, string>>

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

  render() {
    // navigation = {caption: {title: url}}
    if (!this.navigation) {
      return html`<p>No navigation data available.</p>`;
    }

    // Render the navigation items
    const navItems = Object.entries(this.navigation).map(([caption, items]) => {
      return html`
        <div class="navigation-group">
          <h4>${caption}</h4>
          ${Object.entries(items).map(([title, url]) => html`
            <div tab-uri="${url}" class="navigation-item">
              <div class="selector"></div>
              ${title}
            </div>
          `)}
        </div>
      `;
    });

    return html`
      <div class="breadcrumb">
        <div @click="${this.toggleNavigation}" class="breadcrumb-menu-toggle">
          <zn-icon src="menu" size="24"></zn-icon>
        </div>
      </div>
      <div class="tabs">
        <div class="navigation">
          ${navItems}
        </div>
        <div class="menu-overlay"></div>
        <div id="mid" part="mid">
          <div id="content">
            <slot></slot>
          </div>
        </div>
      </div>
    `;
  }
}
