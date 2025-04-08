import {property} from 'lit/decorators.js';
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import ZincElement from '../../internal/zinc-element';

import styles from './chip.scss';
import {HasSlotController} from "../../internal/slot";
import {classMap} from "lit/directives/class-map.js";

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

  @property() type: 'info' | 'success' | 'warning' | 'error' | 'primary' |
    'transparent' | 'neutral' = 'neutral';

  @property() size: 'small' | 'medium' | 'large' = 'medium';

  private readonly hasSlotController = new HasSlotController(this, '[default]', 'action');

  render() {
    return html`
      <div class=${classMap({
        'chip': true,
        'chip--info': this.type === 'info',
        'chip--success': this.type === 'success',
        'chip--warning': this.type === 'warning',
        'chip--error': this.type === 'error',
        'chip--primary': this.type === 'primary',
        'chip--transparent': this.type === 'transparent',
        'chip--neutral': this.type === 'neutral',
        'chip--small': this.size === 'small',
        'chip--medium': this.size === 'medium',
        'chip--large': this.size === 'large',
      })}>
        ${this.icon ? html`
          <zn-icon library="material-outlined" src="${this.icon}" size="18"></zn-icon>` : ''}
        ${this.hasSlotController.test('[default]') ? html`
          <slot></slot>` : ''}
        ${this.hasSlotController.test('action') ? html`
          <slot name="action" class="chip__action"></slot>` : ''}
      </div>
    `;
  }
}
