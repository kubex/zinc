import { property } from 'lit/decorators.js';
import { type CSSResultGroup, html, unsafeCSS } from 'lit';
import ZincElement from '../../internal/zinc-element';

import styles from './chip.scss';
import { HasSlotController } from "../../internal/slot";

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

  @property({ type: String }) icon: string = '';
  @property({ type: String }) type: string = ''; // Just used in CSS

  private readonly hasSlotController = new HasSlotController(this, '[default]', 'action');

  render() {
    return html`
      ${this.icon ? html`
        <zn-icon library="material-outlined" src="${this.icon}" size="18"></zn-icon>` : ''}
      ${this.hasSlotController.test('[default]') ? html`
        <slot></slot>` : ''}
      ${this.hasSlotController.test('action') ? html`
        <slot name="action"></slot>` : ''}
    `;
  }
}
