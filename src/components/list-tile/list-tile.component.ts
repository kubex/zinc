import { property } from 'lit/decorators.js';
import { type CSSResultGroup, html, unsafeCSS } from 'lit';
import ZincElement from '../../internal/zinc-element';
import { HasSlotController } from "../../internal/slot";
import { classMap } from "lit/directives/class-map.js";

import styles from './list-tile.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/list-tile
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
export default class ZnListTile extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  private readonly hasSlotController = new HasSlotController(this, '[default]');

  @property({ attribute: 'caption', reflect: true }) caption: string;
  @property({ attribute: 'description', reflect: true }) description: string;
  @property({ attribute: 'href', reflect: true }) href: string;

  render() {
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
