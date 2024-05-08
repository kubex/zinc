import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss?inline';

@customElement('zn-stepper')
export class Stepper extends LitElement
{
  static styles = unsafeCSS(styles);

  @property({type: String, reflect: true}) caption: string | undefined;
  @property({type: String, reflect: true}) label: string | undefined;
  @property({type: Number, reflect: true}) steps: number | undefined;
  @property({type: Number, reflect: true}) value: number | undefined;
  @property({type: Boolean, reflect: true, attribute: 'show-progress'})
  showProgress: boolean | undefined;

  render()
  {
    const steps = [];
    for(let i = 0; i < this.steps; i++)
    {
      steps.push(html`
        <div class="step">
        </div>
      `);
    }

    let progress = this.value / this.steps * 100;
    if(progress > 100) progress = 100;

    return html`
      ${this.label
        ? html`
          <div class="label">
            ${this.label
              ? html`
                <p class="info">
                  ${this.label}
                </p>`
              : ''}
          </div>
        `
        : ''}
      ${this.caption || this.showProgress
        ? html`
          <div class="header">
            <p class="caption">${this.caption}</p>
            ${this.showProgress
              ? html`
                <p class="progress">${this.value > this.steps ? this.steps : this.value} / ${this.steps} steps</p>`
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


