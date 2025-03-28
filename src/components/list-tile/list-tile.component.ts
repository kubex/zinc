import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, unsafeCSS} from 'lit';
import {HasSlotController} from "../../internal/slot";
import {html} from "lit/static-html.js";
import {property} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';

import styles from './list-tile.scss';
import {ifDefined} from "lit/directives/if-defined.js";

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
  @property({attribute: 'link'}) href: string;
  @property({attribute: 'data-target'}) dataTarget: string;

  private clickHandler = (e: MouseEvent) => {
    e.preventDefault();

    if (e.target && (e.target as HTMLElement).tagName === 'ZN-BUTTON') {
      console.log('button clicked');
      return;
    }

    this.dispatchEvent(new CustomEvent('zn-click', {bubbles: true, composed: true}));

    const anchor = this.shadowRoot?.querySelector<HTMLAnchorElement>('#anchor-trigger');
    if (anchor) {
      anchor.click();
    }
  }

  render() {
    return html`
      ${this.href ? html`<a id="anchor-trigger" href="${this.href}" style="display: none"></a>` : ''}
      <div
        @click="${this.href ? this.clickHandler : undefined}"
        data-target="${ifDefined(this.dataTarget)}"
        class="${classMap({
          tile: true,
          'tile--has-image': this.hasSlotController.test('image'),
          'tile--has-href': this.href
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
