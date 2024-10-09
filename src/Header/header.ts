import {html, TemplateResult, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ZincElement} from "../zinc-element";

import styles from './index.scss?inline';
import {NavBar} from "../NavBar";
import {PropertyValues} from "@lit/reactive-element";

@customElement('zn-header')
export class Header extends ZincElement
{
  @property({attribute: 'full-location', type: String, reflect: true}) fullLocation: string;
  @property({attribute: 'entity-id', type: String, reflect: true}) entityId: string;
  @property({attribute: 'entity-id-show', type: Boolean, reflect: true}) entityIdShow: boolean;
  @property({attribute: 'transparent', type: Boolean, reflect: true}) transparent: boolean = false;
  @property({attribute: 'caption', type: String, reflect: true}) caption: String;
  @property({attribute: 'navigation', type: Array, reflect: true}) navigation = [];
  @property({attribute: 'breadcrumb', type: Array}) breadcrumb = [];
  @property({attribute: 'full-width', type: Boolean, reflect: true}) fullWidth: boolean;
  @property({attribute: 'previous-path', type: String, reflect: true}) previousPath: string;
  @property({attribute: 'previous-target', type: String, reflect: true}) previousTarget: string;

  private _hasNav: boolean;
  private _navBar;

  static styles = unsafeCSS(styles);

  connectedCallback()
  {
    super.connectedCallback();
    window.addEventListener('alt-press', () => this.classList.toggle('alt-pressed', true));
    window.addEventListener('alt-up', () => this.classList.toggle('alt-pressed', false));
  }

  protected firstUpdated(_changedProperties: PropertyValues)
  {
    super.firstUpdated(_changedProperties);
    this._navBar = this.querySelector('zn-navbar');
    this.updateNav();
  }

  updateNav()
  {
    if(!this._navBar && this.navigation && this.navigation.length > 0)
    {
      this._navBar = document.createElement('zn-navbar');
      const nc = this.shadowRoot.querySelector('#nav-container');
      if(nc)
      {
        nc.classList.remove('navless');
        nc.appendChild(this._navBar);
      }
    }
    if(this._navBar)
    {
      this._hasNav = true;
      (this._navBar as NavBar).navigation = this.navigation;
      this._navBar.setAttribute('baseless', '');
    }
  }

  protected updated(_changedProperties: PropertyValues)
  {
    super.updated(_changedProperties);
    _changedProperties.forEach((oldValue, propName) =>
    {
      if(propName == 'navigation')
      {
        setTimeout(this.updateNav.bind(this), 100);
      }
    });
  }

  render()
  {

    if(this.caption == "" && (!this._hasNav) && (!this?.breadcrumb?.length))
    {
      return html``;
    }

    let breadcrumb: TemplateResult;
    if(this?.breadcrumb?.length)
    {
      breadcrumb = html`
        ${this.breadcrumb.map((item, index) =>
        {
          const prefix = index == 0 ? '' : ' > ';
          if(item.path == '')
          {
            return html`
              ${prefix} <span>${item.title}</span>`;
          }
          return html`
            ${prefix} <a href="${item.path}">${item.title}</a>`;
        })}`;
    }

    let caption: TemplateResult;
    if(this.caption)
    {
      caption = html`
        <h1>${this.caption}</h1>`;
    }

    let inNew: TemplateResult;
    if(this.fullLocation)
    {
      inNew = html`
        <a href="${this.fullLocation}" target="_blank">
          <zn-icon src="open_in_new"></zn-icon>
        </a>`;
    }

    let backButton: TemplateResult;
    if(this.previousPath && this.previousPath.length > 0)
    {
      backButton = html`
        <a href="${this.previousPath}" data-target="${this.previousTarget ? this.previousTarget : ''}">
          <zn-icon src="arrow_back"></zn-icon>
        </a>`;
    }

    let entityId: TemplateResult;
    if(this.entityId)
    {
      entityId = html`
        <zn-icon src="fingerprint" onclick="navigator.clipboard.writeText('${this.entityId}')"></zn-icon>
        ${this.entityIdShow ? this.entityId : ''}`;
    }

    let url: TemplateResult;
    if(this.fullLocation)
    {
      url = html`
        <zn-icon src="link" onclick="navigator.clipboard.writeText('${this.fullLocation}')"></zn-icon>`;
    }

    // Do not add formatting within breadcrumb or navigation - css:empty in use
    const header = html`
      <div>
        <div class="alt-overlay">${inNew}${entityId}${url}</div>
        <div class="width-container content">
          <div class="breadcrumb">${breadcrumb}</div>
          <div class="caption">
            ${backButton}
            ${caption}
          </div>
          <div class="actions">
            <slot></slot>
          </div>
        </div>
        <div class="width-container ${this._hasNav ? '' : 'navless'}" id="nav-container">
          <slot name="nav"></slot>
        </div>
      </div>
    `;
    if(this.fullWidth)
    {
      return html`
        <style>:host {
          --max-width: 100%; </style>${header}`;
    }

    return header;
  }
}
