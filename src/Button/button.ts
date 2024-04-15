import { html, unsafeCSS } from "lit";
import { customElement, property } from 'lit/decorators.js';

import styles from './index.scss';
import { ZincElement } from "../zinc";

export type ButtonColor = 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
export type ButtonSizes = 'x-small' | 'small' | 'normal' | 'medium' | 'large';
export type VerticalAlignments = 'start' | 'center' | 'end';
export type IconPosition = 'left' | 'right';

@customElement('zn-button')
export class Button extends ZincElement
{
  @property({ type: String }) color: ButtonColor = 'primary';
  @property({ type: String }) size: ButtonSizes;
  @property({ type: String }) verticalAlign: VerticalAlignments;
  @property({ type: Boolean }) submit: boolean = false;

  @property({ type: String }) content = '';
  @property({ type: String }) icon: string = '';
  @property({ type: String }) iconPosition: IconPosition = 'left';
  @property({ type: String }) iconSize: string = '24';

  static styles = unsafeCSS(styles);

  protected render(): unknown
  {
    const typeAttribute = this.submit ? 'submit' : 'button';
    const icon = this.icon ? html`
      <zn-icon src="${this.icon}" id="xy2" size="${this.iconSize}"></zn-icon>` : '';

    if(this.icon)
    {
      if(this.iconPosition === 'left')
      {
        return html`
          <button type="${typeAttribute}">
            ${icon}
            <slot></slot>
          </button>`;
      }
      else
      {
        return html`
          <button type="${typeAttribute}">
            <slot></slot>
            ${icon}
          </button>`;
      }
    }

    return html`
      <button type=${typeAttribute}>
        <slot></slot>
      </button>`;
  }
}


