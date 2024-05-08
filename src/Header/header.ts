import {html, TemplateResult, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ZincElement} from "../zinc-element";

import styles from './index.scss';
import {NavBar} from "../NavBar";
import {PropertyValues} from "@lit/reactive-element";

@customElement('zn-header')
export class Header extends ZincElement
{
  @property({attribute: 'full-location', type: String}) fullLocation: string;
  @property({attribute: 'transparent', type: Boolean, reflect: true}) transparent: boolean = false;
  @property({attribute: 'caption', type: String, reflect: true}) caption: String;
  @property({attribute: 'navigation', type: Array, reflect: true}) navigation = [];
  @property({attribute: 'breadcrumb', type: Array}) breadcrumb = [];
  @property({attribute: 'full-width', type: Boolean, reflect: true}) fullWidth: boolean;

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
        <div class="new-window-launch">
          <a href="${this.fullLocation}" target="_blank">
            <zn-icon src="open_in_new"></zn-icon>
          </a>
        </div>`;
    }

    // Do not add formatting within breadcrumb or navigation - css:empty in use
    const header = html`
      <div>
        ${inNew}
        <div class="width-container content">
          <div class="breadcrumb">${breadcrumb}</div>
          ${caption}
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
