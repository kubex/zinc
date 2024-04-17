import {html, TemplateResult, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ZincElement} from "../zinc";

import styles from './index.scss';

@customElement('zn-navbar')
export class NavBar extends ZincElement
{

  @property({attribute: 'navigation', type: Array}) navigation = [];
  @property({attribute: 'full-width', type: Boolean, reflect: true}) fullWidth: boolean;

  static styles = unsafeCSS(styles);

  render()
  {
    return html`
      <ul>
        <slot></slot>
        ${this.navigation.map((item, index) =>
        {
          const activeClass = item.active ? 'active' : '';
          return html`
            <li class="${activeClass}" tab-uri="${item.path}">${item.title}</li>`;
        })}
        <slot name="last"></slot>
      </ul>`;
  }
}
