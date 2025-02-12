import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss?inline';
import {HasSlotController} from "@/slot";
import {classMap} from "lit/directives/class-map.js";

@customElement('zn-list-tile')
export class ListTile extends LitElement
{
  static styles = unsafeCSS(styles);

  private readonly hasSlotController = new HasSlotController(this, '[default]');

  @property({attribute: 'caption', type: String, reflect: true}) caption;
  @property({attribute: 'description', type: String, reflect: true}) description;
  @property({attribute: 'href', type: String, reflect: true}) href;

  render()
  {
    return html`
      <div class="${classMap({
        tile: true,
        'tile--has-image': this.hasSlotController.test('image')
      })}">
        <div class="tile__left">
          <slot name="image" part="image" class="tile__image"></slot>
          <div class="tile__content">
            <p part="caption" class="tile__caption">${this.caption}</p>
            <p part="description" class="tile__description">${this.description}</p>
          </div>
        </div>
        <div class="tile__right">
          <slot name="properties" part="properties" class="tile__properties"></slot>
          <slot name="actions" part="actions" class="tile__actions"></slot>
          ${this.href ? html`<a href="${this.href}" class="tile__link">
            <zn-icon src="keyboard_arrow_right"></zn-icon>
          </a>` : ''}
        </div>
      </div>`;
  }
}


