import { type CSSResultGroup, html, unsafeCSS } from 'lit';
import { HasSlotController } from '../../internal/slot';
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
 * @property {string} type - Marker colour: neutral, primary, success, error, warning, info or ai (AI-generated steps only). Overrides `active`.
 * @property {boolean} selected - When true, rings the marker to show the step is picked.
 * @property {boolean} dashed - When true, draws the marker's border dashed, for a step that is not yet final.
 * @property {boolean} highlightLine - When true, colours the line below this step's marker, joining it to the next step.
 *
 * @slot - Content below the caption and description, such as metadata or chips.
 * @slot icon - Optional slot for adding an icon or indicator before the step content.
 * @slot suffix - Inline content after the caption and description, such as status chips.
 * @slot actions - Controls aligned to the end of the step.
 *
 * @csspart vs - The main container for the vertical stepper.
 * @csspart vs__left - The left section containing the icon and connecting line.
 * @csspart vs__icon - The icon container.
 * @csspart vs__line - The vertical connecting line between steps.
 * @csspart vs__right - The right section containing caption and description text.
 * @csspart vs__caption - The caption/title text element.
 * @csspart vs__description - The description text element.
 * @csspart vs__content - The container for the default slot.
 * @csspart vs__actions - The container for the actions slot.
 */
export default class ZnVerticalStepper extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({ type: Boolean, reflect: true }) last = false;
  @property({ type: Boolean, reflect: true }) first = false;
  @property({ type: Boolean, reflect: true }) active = false;
  @property({ reflect: true }) description: string;
  @property({ reflect: true }) caption: string;

  @property({ reflect: true }) type: 'neutral' | 'primary' | 'success' | 'error' | 'warning' | 'info' | 'ai';

  @property({ type: Boolean, reflect: true }) selected = false;
  @property({ type: Boolean, reflect: true }) dashed = false;
  @property({ attribute: 'highlight-line', type: Boolean, reflect: true }) highlightLine = false;

  private readonly hasSlotController = new HasSlotController(this, '[default]', 'suffix', 'actions');

  render() {
    const hasContent = this.hasSlotController.test('[default]');
    const hasSuffix = this.hasSlotController.test('suffix');
    const hasActions = this.hasSlotController.test('actions');
    return html`
      <div class="vs" part="vs">
        <div class="vs__left" part="vs__left">
          <div class="vs__icon" part="vs__icon">
            <slot name="icon"></slot>
          </div>
          <div class="vs__line" part="vs__line"></div>
        </div>
        <div class="vs__right" part="vs__right">
          <div class="vs__heading">
            <span class="vs__caption" part="vs__caption">${this.caption}</span><span class="vs__description"
                                                                                       part="vs__description">${this.description}</span>
            <slot name="suffix" class="vs__suffix" ?hidden=${!hasSuffix}></slot>
          </div>
          <div class="vs__content" part="vs__content" ?hidden=${!hasContent}>
            <slot></slot>
          </div>
        </div>
        <div class="vs__actions" part="vs__actions" ?hidden=${!hasActions}>
          <slot name="actions"></slot>
        </div>
      </div>
    `;
  }
}
