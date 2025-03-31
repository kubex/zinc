import {property} from 'lit/decorators.js';
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import ZincElement from '../../internal/zinc-element';

import styles from './stepper.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/stepper
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
