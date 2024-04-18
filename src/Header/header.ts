import {html, TemplateResult, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ZincElement} from "../zinc";

import styles from './index.scss';

@customElement('zn-header')
export class Header extends ZincElement
{
  @property({attribute: 'transparent', type: Boolean, reflect: true}) transparent: boolean = false;
  @property({attribute: 'caption', type: String, reflect: true}) caption: String;
  @property({attribute: 'breadcrumb', type: Array}) breadcrumb = [];
  @property({attribute: 'full-width', type: Boolean, reflect: true}) fullWidth: boolean;

  private _hasNav: boolean;

  static styles = unsafeCSS(styles);

  connectedCallback()
  {
    super.connectedCallback();
    const nav = this.querySelector('zn-navbar');
    if(nav)
    {
      this._hasNav = true;
      nav.setAttribute('baseless', '');
    }
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

    // Do not add formatting within breadcrumb or navigation - css:empty in use
    const header = html`
      <div>
        <div class="width-container content">
          <div class="breadcrumb">${breadcrumb}</div>
          ${caption}
          <div class="actions">
            <slot></slot>
          </div>
        </div>
        <div class="width-container ${this._hasNav ? 'jas' : 'navless'}">
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
