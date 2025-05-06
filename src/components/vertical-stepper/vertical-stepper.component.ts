import { type CSSResultGroup, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';

import styles from './vertical-stepper.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/vertical-stepper
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
export default class ZnVerticalStepper extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({ type: Boolean, reflect: true }) last = false;
  @property({ type: Boolean, reflect: true }) first = false;
  @property({ type: Boolean, reflect: true }) active = false;
  @property({ reflect: true }) description: string;
  @property({ reflect: true }) caption: string;

  render() {
    return html`
      <div class="vs">
        <div class="vs__left">
          <div class="vs__icon">
            <slot name="icon"></slot>
          </div>
          <div class="vs__line"></div>
        </div>
        <div class="vs__right">
          <div class="vs__caption">
            ${this.caption}
          </div>
          <div class="vs__description">
            ${this.description}
          </div>
        </div>
      </div>
    `;
  }
}
