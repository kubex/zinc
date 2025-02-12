import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss?inline';
import {classMap} from "lit/directives/class-map.js";

@customElement('zn-list-tile-property')
export class ListTileProperty extends LitElement
{
  static styles = unsafeCSS(styles);

  @property({attribute: 'caption', type: String, reflect: true}) caption;
  @property({attribute: 'description', type: String, reflect: true}) description;

  render()
  {
    return html`
      <div class="${classMap({'tile__property': true})}">
        <p part="caption" class="tile__caption">${this.caption}</p>
        <slot part="description" class="tile__description">${this.description}</slot>
      </div>`;
  }
}


