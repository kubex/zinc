import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {HasSlotController} from "../../internal/slot";
import {property} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';

import styles from './chip.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/chip
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
export default class ZnChip extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property() icon: string = '';

  @property({attribute: 'icon-size', type: Number}) iconSize: number = 18;

  @property() type: 'info' | 'success' | 'warning' | 'error' | 'primary' |
    'transparent' | 'custom' | 'neutral' = 'neutral';

  @property() size: 'small' | 'medium' | 'large'; // Defaults to base chip styling

  @property({attribute: 'flush', type: Boolean, reflect: true}) flush: boolean = false;
  @property({attribute: 'flush-x', type: Boolean, reflect: true}) flushX: boolean = false;
  @property({attribute: 'flush-y', type: Boolean, reflect: true}) flushY: boolean = false;

  private readonly hasSlotController = new HasSlotController(this, '[default]', 'action');

  render() {
    const hasContent = this.hasSlotController.test('[default]')
    return html`
      <div class="${classMap({
        'chip': true,
        'chip--with-content': hasContent,
        'chip--no-content': !hasContent,
        'chip--with-icon': this.icon,
        'chip--flush': this.flush,
        'chip--flush-x': this.flushX,
        'chip--flush-y': this.flushY,
        'chip--info': this.type === 'info',
        'chip--success': this.type === 'success',
        'chip--warning': this.type === 'warning',
        'chip--error': this.type === 'error',
        'chip--primary': this.type === 'primary',
        'chip--transparent': this.type === 'transparent',
        'chip--custom': this.type === 'custom',
        'chip--neutral': this.type === 'neutral',
        'chip--small': this.size === 'small',
        'chip--medium': this.size === 'medium',
        'chip--large': this.size === 'large',
      })}">
        ${this.icon ? html`
          <zn-icon src="${this.icon}" size="${this.iconSize}"></zn-icon>` : ''}
        ${hasContent ? html`
          <slot></slot>` : ''}
        ${this.hasSlotController.test('action') ? html`
          <slot name="action" class="chip__action"></slot>` : ''}
      </div>
    `;
  }
}
