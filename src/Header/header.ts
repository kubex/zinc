import {html, TemplateResult, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ZincElement} from "../zinc";

import styles from './index.scss';

@customElement('zn-header')
export class Header extends ZincElement
{
  @property({attribute: 'transparent', type: Boolean, reflect: true}) transparent: boolean = false;
  @property({attribute: 'caption', type: String, reflect: true}) caption: String;
  @property({attribute: 'navigation', type: Array}) navigation = [];
  @property({attribute: 'breadcrumb', type: Array}) breadcrumb = [];
  @property({attribute: 'full-width', type: Boolean, reflect: true}) fullWidth: boolean;

  static styles = unsafeCSS(styles);

  clickNav(e)
  {
    e.target.closest('ul').querySelectorAll('li').forEach((item) =>
    {
      item.classList.remove('active');
    });
    e.target.closest('li').classList.add('active');
  }

  render()
  {

    if(this.caption == "" && (!this?.navigation?.length) && (!this?.breadcrumb?.length))
    {
      return html``;
    }

    let nav: TemplateResult;
    if(this?.navigation?.length)
    {
      nav = html`
        ${this.navigation.map((item, index) =>
        {
          const activeClass = item.active ? 'active' : '';
          return html`
            <li class="${activeClass}">
              <a @click="${this.clickNav}" href="${item.path}">${item.title}</a>
            </li>`;
        })}`;
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
        <div class="width-container">
          <div class="breadcrumb">${breadcrumb}</div>
          ${caption}
          <div class="actions">
            <slot></slot>
          </div>
          <ul class="header-nav">${nav}</ul>
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
