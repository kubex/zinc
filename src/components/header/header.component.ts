import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {HasSlotController} from "../../internal/slot";
import {property} from 'lit/decorators.js';
import {watch} from "../../internal/watch";
import ZincElement from '../../internal/zinc-element';
import type { PropertyValues, TemplateResult} from 'lit';
import type ZnNavbar from "../navbar";

import styles from './header.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/header
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
export default class ZnHeader extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  private readonly hasSlotController = new HasSlotController(this, '[default]', 'nav');

  @property({attribute: 'full-location'}) fullLocation: string;

  @property({attribute: 'entity-id'}) entityId: string;

  @property({attribute: 'entity-id-show', type: Boolean}) entityIdShow: boolean;

  @property({type: Boolean}) transparent: boolean = false;

  @property() caption: string;

  @property() description: string;

  @property({type: Array}) navigation = [];

  @property({type: Array}) breadcrumb: { path: string; title: string }[] = [];

  @property({attribute: 'full-width', type: Boolean}) fullWidth: boolean;

  @property({attribute: 'previous-path'}) previousPath: string;

  @property({attribute: 'previous-target'}) previousTarget: string;

  private navbar: ZnNavbar;

  // Attach any event listeners you may need
  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('alt-press', this.handleAltPress);
    window.addEventListener('alt-up', this.handleAltUp);
  }

  // Clean up event listeners
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('alt-press', this.handleAltPress);
    window.removeEventListener('alt-up', this.handleAltUp);
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    this.navbar = this.querySelector('zn-navbar')!;
    this.updateNav();
  }

  handleAltPress = () => {
    this.classList.toggle('alt-pressed', true);
  }

  handleAltUp = () => {
    this.classList.toggle('alt-pressed', false);
  }

  @watch('navigation', {waitUntilFirstUpdate: true})
  updateNav() {

    if (!this.navbar && this.navigation && this.navigation.length > 0) {
      this.navbar = document.createElement('zn-navbar');
      const nc = this.shadowRoot?.querySelector('#nav-container');
      if (nc) {
        nc.appendChild(this.navbar);
      }
    }

    if (this.navbar) {
      (this.navbar as ZnNavbar).navigation = this.navigation;
      this.navbar.setAttribute('baseless', '');
    }
  }

  render() {
    const hasDefaultSlot = this.hasSlotController.test('[default]');
    const hasNavigationSlot = this.hasSlotController.test('nav');
    const hasNavigation = this.navigation && this.navigation.length > 0 || hasNavigationSlot;

    const hasPreviousPath = this.previousPath;
    const hasEntityId = this.entityId;
    const hasFullLocation = this.fullLocation;
    const hasBreadcrumb = this.breadcrumb && this.breadcrumb.length > 0;

    let breadcrumb: TemplateResult = html``;
    if (hasBreadcrumb) {
      breadcrumb = html`
        ${this.breadcrumb.map((item, index) => {
          const prefix = index === 0 ? '' : ' > ';

          if (item.path === '') {
            return html`
              ${prefix} <span>${item.title}</span>`;
          }

          return html`
            ${prefix} <a href="${item.path}">${item.title}</a>`;
        })}`;
    }

    // Do not add formatting within breadcrumb or navigation - css:empty in use
    const header = html`
      <div class="${classMap({
        'header': true,
        'header--transparent': this.transparent,
        'header--full-width': this.fullWidth,
        'header--has-nav': hasNavigation,
        'header--has-breadcrumb': hasBreadcrumb,
        'header--has-previous': hasPreviousPath,
        'header--has-entity-id': hasEntityId,
        'header--has-full-location': hasFullLocation,
      })}" part="base">

        ${hasFullLocation || hasEntityId ? html`
          <div class="alt-overlay">
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
          ${hasBreadcrumb ? html`
            <div class="breadcrumb">
              ${breadcrumb}  <!--- Maybe make this into a component -->
            </div>` : null}

          ${hasPreviousPath ? html`
            <a href="${this.previousPath}" class="caption__back"
               data-target="${this.previousTarget ? this.previousTarget : ''}">
              <zn-button size="content" icon="arrow_back" icon-size="24" color="transparent"></zn-buttonicon>
            </a>` : null}

          ${hasDefaultSlot ? html`
            <div class="actions">
              <slot></slot>
            </div>` : ''}

          <div class="caption">
            <div class="header__left">
              <span class="header__caption" part="header-caption">${this.caption}</span>
              <span class="header__description">${this.description}</span>
            </div>

            <div class="header__right">
              <slot name="actions"></slot>
            </div>
          </div>

        </div>

        ${hasNavigation ? html`
          <div id="nav-container">
            <slot name="nav"></slot>
          </div>` : null}

      </div>
    `;
    if (this.fullWidth) {
      return html`
        <style>
          :host {
            --max-width: 100%;
          }
        </style>${header}`;
    }

    return header;
  }
}
