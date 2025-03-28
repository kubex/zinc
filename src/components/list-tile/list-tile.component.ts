import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, unsafeCSS} from 'lit';
import {HasSlotController} from "../../internal/slot";
import {html, literal} from "lit/static-html.js";
import {property} from 'lit/decorators.js';
import {ifDefined} from "lit/directives/if-defined.js";
import ZincElement from '../../internal/zinc-element';

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

  @property({attribute: 'caption'}) caption: string;

  @property({attribute: 'description'}) description: string;

  @property({attribute: 'href'}) href: string;

  @property({attribute: 'data-target'}) dataTarget: string;

  @property({attribute: 'data-uri'}) dataUri: string;

  private _isLink() {
    return this.href || this.dataUri;
  }

  render() {
    const isLink = this._isLink();
    const tag = isLink ? literal`a` : literal`div`;

    return html`
      <${tag}
        href="${ifDefined(this.href)}"
        data-uri="${ifDefined(this.dataUri)}"
        data-target="${ifDefined(this.dataTarget)}"
        class="${classMap({
          tile: true,
          'tile--has-image': this.hasSlotController.test('image'),
          'tile--has-href': isLink
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
        </div>
        </div>`;
  }
}
