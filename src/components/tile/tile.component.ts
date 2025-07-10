import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, unsafeCSS} from 'lit';
import {HasSlotController} from "../../internal/slot";
import {html, literal} from "lit/static-html.js";
import {ifDefined} from "lit/directives/if-defined.js";
import {property} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';

import styles from './tile.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/tile
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
export default class ZnTile extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  private readonly hasSlotController = new HasSlotController(this, '[default]');

  @property({attribute: 'caption'}) caption: string;

  @property({attribute: 'description'}) description: string;

  @property({attribute: 'href'}) href: string;

  @property({attribute: 'data-target'}) dataTarget: string;

  @property({attribute: 'gaid'}) gaid: string;

  @property({attribute: 'data-uri'}) dataUri: string;

  @property({type: Boolean}) flush: boolean;

  @property({attribute: 'flush-x', type: Boolean}) flushX: boolean;

  @property({attribute: 'flush-y', type: Boolean}) flushY: boolean;

  private _isLink() {
    return this.href || this.dataUri;
  }

  render() {
    const isLink = this._isLink();
    const tag = isLink ? literal`a` : literal`div`;
    const hasCaption = this.caption && this.caption.length > 0;
    const hasDescription = this.description && this.description.length > 0;
    const hasProperties = this.hasSlotController.test('properties');
    const hasActions = this.hasSlotController.test('actions');
    const hasImage = this.hasSlotController.test('image');

    return html`
      <${tag}
        href="${ifDefined(this.href)}"
        data-uri="${ifDefined(this.dataUri)}"
        gaid="${ifDefined(this.gaid)}"
        data-target="${ifDefined(this.dataTarget)}"
        class="${classMap({
          tile: true,
          'tile--flush': this.flush,
          'tile--flush-x': this.flushX,
          'tile--flush-y': this.flushY,
          'tile--has-href': isLink,
          'tile--has-caption': hasCaption,
          'tile--has-description': hasDescription,
          'tile--has-properties': hasProperties,
          'tile--has-actions': hasActions,
          'tile--has-image': hasImage,
        })}">
        ${!hasCaption && !hasDescription && !hasProperties && !hasActions ? html`
          <slot></slot>
        ` : html`
          <div
            class="tile__link">
            <div class="tile__left">
              <slot name="image" part="image" class="tile__image"></slot>
              <div class="tile__content">
                <p part="caption" class="tile__caption">${this.caption}</p>
                <p part="description" class="tile__description">${this.description}</p>
              </div>
            </div>
          </div>

          <div class="tile__right">
            <slot name="properties" part="properties" class="tile__properties"></slot>
            <slot name="actions" part="actions" class="tile__actions"></slot>
          </div>`}
      </${tag}>`;
  }
}
