import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, unsafeCSS} from 'lit';
import {HasSlotController} from "../../internal/slot";
import {html, literal} from "lit/static-html.js";
import {ifDefined} from "lit/directives/if-defined.js";
import {property} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import ZnIcon from '../icon';

import styles from './tile.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/tile
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-icon
 *
 * @event zn-event-name - Emitted as an example.
 *
 * @slot - The default slot.
 * @slot example - An example slot.
 *
 * @csspart base - The component's base wrapper.
 * @csspart icon - The tinted square around the icon.
 *
 * @cssproperty --example - An example CSS custom property.
 * @cssproperty --zn-tile-hover-caption-color - The caption color while a linked tile is hovered.
 * @cssproperty --zn-tile-hover-caption-decoration - The caption text decoration while a linked tile is hovered.
 */
export default class ZnTile extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-icon': ZnIcon,
  };

  private readonly hasSlotController = new HasSlotController(this, '[default]', 'caption', 'description', 'properties', 'actions', 'image');

  @property({attribute: 'caption'}) caption: string;

  @property({attribute: 'description'}) description: string;

  /** Shows the icon in a tinted square before the caption. */
  @property() icon: string;

  /** The tint of the icon square: `success`, `warning`, `danger`, `info`, `ai` or `neutral`. */
  @property({attribute: 'icon-color'}) iconColor: 'success' | 'warning' | 'danger' | 'info' | 'ai' | 'neutral' = 'neutral';

  @property({attribute: 'href'}) href: string;

  @property({attribute: 'data-target'}) dataTarget: string;

  @property({attribute: 'gaid'}) gaid: string;

  @property({attribute: 'data-uri'}) dataUri: string;

  @property({type: Boolean}) flush: boolean;

  @property({attribute: 'flush-x', type: Boolean}) flushX: boolean;

  @property({attribute: 'flush-y', type: Boolean}) flushY: boolean;

  @property({type: Boolean}) inline: boolean;

  /** Renders the caption in the normal table-content weight instead of bold. */
  @property({type: Boolean}) plain: boolean;

  /** Moves the actions under the caption and description when the tile is narrower than 600px. */
  @property({attribute: 'stack-actions', type: Boolean, reflect: true}) stackActions: boolean;

  /** Set by `zn-tile-group` to lay the tile out as a shared-column subgrid row. */
  @property({type: Boolean, reflect: true}) grouped: boolean;

  private _isLink() {
    return this.href || this.dataUri;
  }

  private _handleActionsClick(e: MouseEvent) {
    if (!this._isLink()) return;

    // Let Rubix's delegated pagelet handler see an action's own link. For controls without
    // navigation metadata, stop before the handler can walk up to the tile host's href.
    for (const target of e.composedPath()) {
      if (target === this) break;
      if (!(target instanceof Element)) continue;

      const href = target.getAttribute('href');
      if (target.hasAttribute('data-uri') || (href !== null && href !== '' && !href.startsWith('#'))) {
        return;
      }
    }

    e.stopPropagation();
  }

  render() {
    const isLink = this._isLink();
    const tag = isLink ? literal`a` : literal`div`;
    const hasCaption = (this.caption && this.caption.length > 0) || this.hasSlotController.test('caption');
    const hasDescriptionAttr = this.description && this.description.length > 0;
    const hasDescription = hasDescriptionAttr || this.hasSlotController.test('description');
    const hasProperties = this.hasSlotController.test('properties');
    const hasActions = this.hasSlotController.test('actions');
    const hasImage = this.hasSlotController.test('image');
    const hasIcon = !!this.icon;

    return html`
      <div
        class="${classMap({
          tile: true,
          'tile--flush': this.flush,
          'tile--flush-x': this.flushX,
          'tile--flush-y': this.flushY,
          'tile--inline': this.inline,
          'tile--plain': this.plain,
          'tile--has-href': isLink,
          'tile--has-caption': hasCaption,
          'tile--has-description': hasDescription,
          'tile--has-properties': hasProperties,
          'tile--has-actions': hasActions,
          'tile--has-image': hasImage,
          'tile--has-icon': hasIcon,
        })}">
        <${tag}
          href="${ifDefined(this.href)}"
          data-uri="${ifDefined(this.dataUri)}"
          gaid="${ifDefined(this.gaid)}"
          data-target="${ifDefined(this.dataTarget)}"
          draggable="${ifDefined(isLink ? 'false' : undefined)}"
          class="tile__link">
          ${!hasCaption && !hasDescription && !hasProperties && !hasActions && !hasIcon ? html`
            <slot></slot>
          ` : html`
            <div class="tile__left">
              ${hasImage ? html`
                <slot name="image" part="image" class="tile__image"></slot>` : html``}
              ${hasIcon ? html`
                <span part="icon" class="tile__icon tile__icon--${this.iconColor}">
                  <zn-icon src="${this.icon}" size="18"></zn-icon>
                </span>` : html``}
              <div class="tile__content">
                <p part="caption" class="tile__caption">
                  <slot name="caption">${this.caption}</slot>
                </p>
                ${hasDescriptionAttr ? html`
                  <p part="description" class="tile__description">
                    ${this.description}</p>` : html`<slot name="description" class="tile__description"></slot>`}
              </div>
            </div>
            ${hasProperties ? html`
              <slot name="properties" part="properties" class="tile__properties"></slot>` : ''}
          `}
        </${tag}>

        ${hasActions ? html`
          <div class="tile__right">
            <!-- Kept outside the link so slotted controls retain their default behaviour. -->
              <slot name="actions" part="actions" class="tile__actions"
                    @click=${this._handleActionsClick}></slot>
          </div>` : ''}
      </div>`;
  }
}
