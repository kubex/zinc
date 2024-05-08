import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss?inline';

@customElement('zn-vertical-stepper-item')
export class VerticalStepperItem extends LitElement
{
  static styles = unsafeCSS(styles);

  @property({type: Boolean, reflect: true}) last = false;
  @property({type: String, reflect: true}) description;
  @property({type: String, reflect: true}) caption;

  render()
  {
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


