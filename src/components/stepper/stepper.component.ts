import {classMap} from 'lit/directives/class-map.js';
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {property} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';

import styles from './stepper.scss';

/**
 * @summary Steppers provide visual feedback about progress through a multi-step process or workflow.
 * @documentation https://zinc.style/components/stepper
 * @status experimental
 * @since 1.0
 *
 * @property {string} caption - A descriptive label displayed above the stepper to indicate the current step or phase.
 * @property {string} label - An optional label displayed above the caption, typically used for the wizard or workflow name.
 * @property {number} steps - The total number of steps in the process.
 * @property {number} value - The current step position (0 to steps). Progress is calculated as value/steps.
 * @property {boolean} show-progress - When true, displays the step count (e.g., "2 / 5 steps") next to the caption.
 *
 * @csspart step-container - The container holding the progress line and steps.
 * @csspart step-line - The background line showing the full step track.
 * @csspart step-progress - The filled progress indicator showing completion.
 * @csspart steps - The container for individual step markers.
 * @csspart step - An individual step marker circle.
 *
 * @cssproperty --zn-stepper-track-color - The color of the track.
 * @cssproperty --zn-stepper-marker-color - The color of upcoming step markers.
 * @cssproperty --zn-stepper-progress-color - The color of the fill and reached step markers.
 * @csspart header - The header container with caption and progress text.
 * @csspart caption - The caption text element.
 * @csspart progress - The progress count text (e.g., "2 / 5 steps").
 * @csspart label - The label text container.
 * @csspart info - The label text element.
 */
export default class ZnStepper extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({reflect: true}) caption: string;
  @property({reflect: true}) label: string;
  @property({type: Number, reflect: true}) steps: number
  @property({type: Number, reflect: true}) value: number;
  @property({type: Boolean, reflect: true, attribute: 'show-progress'}) showProgress: boolean;

  render() {
    const steps = Math.max(0, this.steps || 0);
    const value = Math.min(Math.max(0, this.value || 0), steps);
    const ratio = steps ? value / steps : 0;

    const markers = [];
    for (let i = 1; i <= steps; i++) {
      markers.push(html`
        <div part="step"
             class=${classMap({step: true, 'step--complete': i <= value, 'step--current': i === value})}
             style="--step: ${i / steps}"></div>`);
    }

    return html`
      ${this.label
        ? html`
          <div part="label" class="label">
            <span part="info" class="info">${this.label}</span>
          </div>`
        : ''}
      ${this.caption || this.showProgress
        ? html`
          <div part="header" class="header">
            <span part="caption" class="caption">${this.caption}</span>
            ${this.showProgress
              ? html`
                <span part="progress" class="progress">${value} / ${steps} steps</span>`
              : ''}
          </div>`
        : ''}
      <div part="step-container"
           class="step-container"
           role="progressbar"
           aria-label=${ifDefined(this.caption || this.label || undefined)}
           aria-valuemin="0"
           aria-valuemax=${steps}
           aria-valuenow=${value}
           style="--ratio: ${ratio}">
        <div part="step-line" class="step-line"></div>
        <div part="step-progress" class=${classMap({'step-progress': true, 'step-progress--empty': value === 0})}></div>
        <div part="steps" class="steps">${markers}</div>
      </div>
    `;
  }
}
