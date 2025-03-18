import {property, query} from 'lit/decorators.js';
import {type CSSResultGroup, html, PropertyValues, TemplateResult, unsafeCSS} from 'lit';
import ZincElement from '../../internal/zinc-element';
import type ZnNavbar from "../navbar";

import styles from './header.scss';
import {HasSlotController} from "../../internal/slot";

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

  @property({type: Array}) navigation = [];

  @property({type: Array}) breadcrumb = [];

  @property({attribute: 'full-width', type: Boolean}) fullWidth: boolean;

  @property({attribute: 'previous-path'}) previousPath: string;

  @property({attribute: 'previous-target'}) previousTarget: string;

  @query('zn-navbar') navbar: ZnNavbar;


  private _hasNav: boolean;

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
    this.updateNav();
  }

  handleAltPress = () => {
    this.classList.toggle('alt-pressed', true);
  }

  handleAltUp = () => {
    this.classList.toggle('alt-pressed', false);
  }

  updateNav() {
    if (!this.navbar && this.navigation && this.navigation.length > 0) {
      this.navbar = document.createElement('zn-navbar');
      const nc = this.shadowRoot?.querySelector('#nav-container');
      if (nc) {
        nc.classList.remove('navless');
        nc.appendChild(this.navbar);
      }
    }
    if (this.navbar) {
      this._hasNav = true;
      (this.navbar as ZnNavbar).navigation = this.navigation;
      this.navbar.setAttribute('baseless', '');
    }
  }

  protected updated(_changedProperties: PropertyValues) {
    super.updated(_changedProperties);
    _changedProperties.forEach((_oldValue: any, propName: any) => {
      if (propName == 'navigation') {
        setTimeout(this.updateNav.bind(this), 100);
      }
    });
  }

  render() {
    if (this.caption == "" && (!this._hasNav) && (!this?.breadcrumb?.length)) {
      return html``;
    }

    let breadcrumb: TemplateResult = html``;
    if (this?.breadcrumb?.length) {
      breadcrumb = html`
        ${this.breadcrumb.map((item: any, index) => {
          const prefix = index == 0 ? '' : ' > ';
          if (item.path == '') {
            return html`
              ${prefix} <span>${item.title}</span>`;
          }
          return html`
            ${prefix} <a href="${item.path}">${item.title}</a>`;
        })}`;
    }

    let caption: TemplateResult = html``;
    if (this.caption) {
      caption = html`
        <h1>${this.caption}</h1>`;
    }

    let inNew: TemplateResult = html``;
    if (this.fullLocation) {
      inNew = html`
        <a href="${this.fullLocation}" target="_blank">
          <zn-icon src="open_in_new"></zn-icon>
        </a>`;
    }

    let backButton: TemplateResult = html``;
    if (this.previousPath && this.previousPath.length > 0) {
      backButton = html`
        <a href="${this.previousPath}" class="caption__back"
           data-target="${this.previousTarget ? this.previousTarget : ''}">
          <zn-icon src="arrow_back"></zn-icon>
        </a>`;
    }

    let entityId: TemplateResult = html``;
    if (this.entityId) {
      entityId = html`
        <zn-icon src="fingerprint" onclick="navigator.clipboard.writeText('${this.entityId}')"></zn-icon>
        ${this.entityIdShow ? this.entityId : ''}`;
    }

    let url: TemplateResult = html``;
    if (this.fullLocation) {
      url = html`
        <zn-icon src="link" onclick="navigator.clipboard.writeText('${this.fullLocation}')"></zn-icon>`;
    }

    const hasDefaultSlot = this.hasSlotController.test('[default]');

    // Do not add formatting within breadcrumb or navigation - css:empty in use
    const header = html`
      <div>
        <div class="alt-overlay">${inNew}${entityId}${url}</div>
        <div class="width-container content">
          <div class="breadcrumb">${breadcrumb}</div>
          ${hasDefaultSlot ? html`
            <div class="actions">
              <slot></slot>
            </div>` : ''}
          <div class="caption">
            ${backButton}
            ${caption}
          </div>
        </div>
        <div class="width-container ${this._hasNav ? '' : 'navless'}" id="nav-container">
          <slot name="nav"></slot>
        </div>
      </div>
    `;
    if (this.fullWidth) {
      return html`
        <style>:host {
          --max-width: 100%; </style>${header}`;
    }

    return header;
  }
}
