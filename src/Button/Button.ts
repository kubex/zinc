import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss';

export type ButtonVariations = 'primary' | 'secondary';
export type ButtonSizes = 'small' | 'normal' | 'large';
export type VerticalAlignments = 'start' | 'center' | 'end';

@customElement('zn-button')
export class Button extends LitElement {
  @property({attribute: 'content', type: String, reflect: true}) content = 'Button';
  @property({attribute: 'variant', type: String, reflect: true}) variant: ButtonVariations = 'primary';
  @property({attribute: 'size', type: String, reflect: true}) size: ButtonSizes;
  @property({attribute: 'vertical-align', type: String, reflect: true}) verticalAlign: VerticalAlignments;
  @property({attribute: 'disabled', type: Boolean, reflect: true}) disabled: boolean = false;
  @property({attribute: 'submit', type: Boolean, reflect: true}) submit: boolean = false;
  @property({attribute: 'grow', type: Boolean, reflect: true}) grow: boolean = false;

  static styles = unsafeCSS(styles);

  protected render(): unknown {
    const typeAttribute = this.submit ? 'submit' : 'button';
    const shouldGrow = this.grow ? 'grow' : '';


    return html`
      <button class=${shouldGrow} type=${typeAttribute}>${this.content}</button>`
  }
}


