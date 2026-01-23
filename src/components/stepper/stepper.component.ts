import {property} from 'lit/decorators.js';
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
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
    const steps = [];
    for (let i = 0; i < this.steps; i++) {
      steps.push(html`
        <div class="step">
        </div>
      `);
    }

    let progress = this.value / this.steps * 100;
    if (progress > 100) progress = 100;

    return html`
      ${this.label
        ? html`
          <div class="label">
            ${this.label
              ? html`
                <span class="info">
                  ${this.label}
                </span>`
              : ''}
          </div>
        `
        : ''}
      ${this.caption || this.showProgress
        ? html`
          <div class="header">
            <span class="caption">${this.caption}</span>
            ${this.showProgress
              ? html`
                <span class="progress">${this.value > this.steps ? this.steps : this.value} / ${this.steps} steps</span>`
              : ''}
          </div>
        `
        : ''}
      <div class="step-container">
        <div class="step-line"></div>
        <div id="progress" class="step-progress"
             style="width: calc((${progress}% - 4px) + 1px)"></div>
        <div class="steps">
          <div></div>
          ${steps}
        </div>
      </div>
    `;
  }
}
