import {property} from 'lit/decorators.js';
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

  @property({attribute: 'full-location', reflect: true}) fullLocation: string;
  @property({attribute: 'entity-id', reflect: true}) entityId: string;
  @property({attribute: 'entity-id-show', type: Boolean, reflect: true}) entityIdShow: boolean;
  @property({attribute: 'transparent', type: Boolean, reflect: true}) transparent: boolean = false;
  @property({attribute: 'caption', reflect: true}) caption: String;
  @property({attribute: 'navigation', type: Array, reflect: true}) navigation = [];
  @property({attribute: 'breadcrumb', type: Array}) breadcrumb = [];
  @property({attribute: 'full-width', type: Boolean, reflect: true}) fullWidth: boolean;
  @property({attribute: 'previous-path', reflect: true}) previousPath: string;
  @property({attribute: 'previous-target', reflect: true}) previousTarget: string;

  private readonly hasSlotController = new HasSlotController(this, '[default]', 'nav');

  private _hasNav: boolean;
  private _navBar: ZnNavbar;

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('alt-press', () => this.classList.toggle('alt-pressed', true));
    window.addEventListener('alt-up', () => this.classList.toggle('alt-pressed', false));
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    this._navBar = this.querySelector('zn-navbar') as ZnNavbar;
    this.updateNav();
  }

  updateNav() {
    if (!this._navBar && this.navigation && this.navigation.length > 0) {
      this._navBar = document.createElement('zn-navbar');
      const nc = this.shadowRoot?.querySelector('#nav-container');
      if (nc) {
        nc.classList.remove('navless');
        nc.appendChild(this._navBar);
      }
    }
    if (this._navBar) {
      this._hasNav = true;
      (this._navBar as ZnNavbar).navigation = this.navigation;
      this._navBar.setAttribute('baseless', '');
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
        <a href="${this.previousPath}" data-target="${this.previousTarget ? this.previousTarget : ''}">
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
    const hasNavSlot = this.hasSlotController.test('nav');

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
        ${hasNavSlot ? html`
          <div class="width-container ${this._hasNav ? '' : 'navless'}" id="nav-container">
            <slot name="nav"></slot>
          </div>` : ''}
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
