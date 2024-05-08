import {html, TemplateResult, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ZincElement} from "../zinc-element";


import styles from './index.scss?inline';

@customElement('zn-navbar')
export class NavBar extends ZincElement
{

  private _preItems: NodeListOf<Element>;
  private _postItems: NodeListOf<Element>;
  @property({attribute: 'navigation', type: Array}) navigation = [];
  @property({attribute: 'full-width', type: Boolean, reflect: true}) fullWidth: boolean;

  static styles = unsafeCSS(styles);

  connectedCallback()
  {
    super.connectedCallback();
    this._preItems = this.querySelectorAll('li:not([suffix])');
    this._postItems = this.querySelectorAll('li[suffix]');
  }

  render()
  {
    return html`
      <ul>
        ${this._preItems}
        ${this.navigation.map((item, index) =>
        {
          const activeClass = item.active ? 'active' : '';
          if(item.path != undefined)
          {
            return html`
              <li class="${activeClass}" tab-uri="${item.path}">${item.title}</li>`;
          }
          return html`
            <li class="${activeClass}" tab="">${item.title}</li>`;
        })}
        ${this._postItems}
      </ul>`;
  }
}
