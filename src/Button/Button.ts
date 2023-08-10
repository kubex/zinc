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

  static styles = unsafeCSS(styles);

  protected render(): unknown {
    return html`
      <button>${this.content}</button>`
  }
}


