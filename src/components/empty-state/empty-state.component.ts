import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {HasSlotController} from "../../internal/slot";
import {property} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';

import styles from './empty-state.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/empty-state
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
export default class ZnEmptyState extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({type: String}) icon: string = '';

  @property({type: String}) caption: string = '';

  @property({type: String}) description: string = '';

  @property({type: String}) type: 'error' | 'info' | 'primary' | '' = '';

  @property({type: Boolean}) padded: boolean = false;

  private readonly hasSlotController = new HasSlotController(this, '[default]', 'caption', 'description');

  render() {
    return html`
      <div class="${classMap({
        'empty-state': true,
        'empty-state--error': this.type === 'error',
        'empty-state--info': this.type === 'info',
        'empty-state--primary': this.type === 'primary',
        'empty-state--padded': this.padded
      })}">
        <div class="empty-state__wrapper">
          ${this.icon || this.hasSlotController.test('icon')
            ? html`
              <zn-icon src="${this.icon}" size="48" color="${this.type ? this.type : 'primary'}"></zn-icon>`
            : ''}
          ${this.caption || this.hasSlotController.test('caption')
            ? html`
              <div class="caption">
                <slot name="caption">${this.caption}</slot>
              </div>`
            : ''}
          ${this.description || this.hasSlotController.test('description')
            ? html`
              <div class="description">
                <slot name="description">${this.description}</slot>
              </div>`
            : ''}
          <slot></slot>
        </div>
      </div>`
  }
}
