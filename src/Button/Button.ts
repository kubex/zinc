import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss';
import {ZincElement} from "../zinc";

export type ButtonColor = 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
export type ButtonSizes = 'small' | 'normal' | 'medium' | 'large';
export type VerticalAlignments = 'start' | 'center' | 'end';
export type IconPosition = 'left' | 'right';

@customElement('zn-button')
export class Button extends ZincElement
{
  @property({type: String}) variant: ButtonColor = 'primary';
  @property({type: String}) size: ButtonSizes;
  @property({type: String}) verticalAlign: VerticalAlignments;
  @property({type: Boolean}) disabled: boolean = false;
  @property({type: Boolean}) submit: boolean = false;
  @property({type: Boolean}) grow: boolean = false;

  @property({type: String}) content = '';
  @property({type: String}) icon: string = '';
  @property({type: String}) iconPosition: IconPosition = 'left';

  static styles = unsafeCSS(styles);

  protected render(): unknown
  {
    const typeAttribute = this.submit ? 'submit' : 'button';
    const shouldGrow = this.grow ? 'grow' : '';
    const icon = this.icon ? html`
      <zn-icon src="${this.icon}" id="xy2"></zn-icon>` : '';


    if(this.icon)
    {
      if(this.iconPosition === 'left')
      {
        return html`
          <button class="${shouldGrow}" type="${typeAttribute}">${icon}${this.content}
            <slot></slot>
          </button>`;
      }
      else
      {
        return html`
          <button class="${shouldGrow}" type="${typeAttribute}">${this.content}
            <slot></slot>
                                                                ${icon}
          </button>`;
      }
    }

    return html`
      <button class=${shouldGrow} type=${typeAttribute}>${this.content}
        <slot></slot>
      </button>`;
  }
}


