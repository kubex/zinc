import { html, unsafeCSS } from "lit";
import { customElement, property } from 'lit/decorators.js';

import styles from './index.scss?inline';
import { ZincElement } from "../zinc-element";

export type ButtonColor = 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'transparent';
export type ButtonSizes = 'square' | 'x-small' | 'small' | 'normal' | 'medium' | 'large';
export type VerticalAlignments = 'start' | 'center' | 'end';
export type IconPosition = 'left' | 'right';

@customElement('zn-button')
export class Button extends ZincElement
{
  @property({ type: String }) color: ButtonColor = 'primary';
  @property({ type: String }) size: ButtonSizes;
  @property({ type: String }) verticalAlign: VerticalAlignments;

  @property({ type: String }) content = '';
  @property({ type: String }) icon: string = '';
  @property({ type: String }) iconPosition: IconPosition = 'left';
  @property({ type: String, attribute: "icon-size" }) iconSize: string = '24';
  @property() type: 'button' | 'submit' | 'reset' = 'button';

  static styles = unsafeCSS(styles);


  connectedCallback()
  {
    super.connectedCallback();
    if(this.size == "x-small" || this.size == "square")
    {
      this.iconSize = "16";
    }
    else if(this.size == "small")
    {
      this.iconSize = "20";
    }
  }

  private handleClick()
  {
    if(this.type === 'submit')
    {
      const form = this.closest('form');
      if(form)
      {
        form.requestSubmit();
      }
    }
  }

  protected render(): unknown
  {
    let iconColor = 'default';
    if(this.color === 'transparent')
    {
      iconColor = 'primary';
    }

    const icon = this.icon ? html`
      <zn-icon src="${this.icon}" id="xy2" size="${this.iconSize}" color="${iconColor}"></zn-icon>` : '';

    return html`
      <button part="base" type="${this.type}" @click="${this.handleClick}">
        ${this.iconPosition === 'left' ? icon : ''}
        <slot>${this.content}</slot>
        ${this.iconPosition === 'right' ? icon : ''}
      </button>`;

  }
}


