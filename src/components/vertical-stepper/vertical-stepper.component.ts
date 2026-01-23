import { type CSSResultGroup, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';

import styles from './vertical-stepper.scss';

/**
 * @summary Vertical steppers display a sequence of steps in a vertical layout with descriptions and optional icons.
 * @documentation https://zinc.style/components/vertical-stepper
 * @status experimental
 * @since 1.0
 *
 * @property {boolean} last - When true, removes the connecting line below this step (use for the final step in a sequence).
 * @property {boolean} first - When true, indicates this is the first step in the sequence (affects visual styling).
 * @property {boolean} active - When true, highlights this step as the current active step in the process.
 * @property {string} description - A descriptive text explaining what happens in this step or its current status.
 * @property {string} caption - The main label/title for this step.
 *
 * @slot icon - Optional slot for adding an icon or indicator before the step content.
 *
 * @csspart vs - The main container for the vertical stepper.
 * @csspart vs__left - The left section containing the icon and connecting line.
 * @csspart vs__icon - The icon container.
 * @csspart vs__line - The vertical connecting line between steps.
 * @csspart vs__right - The right section containing caption and description text.
 * @csspart vs__caption - The caption/title text element.
 * @csspart vs__description - The description text element.
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
