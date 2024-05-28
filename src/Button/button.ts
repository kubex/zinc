import { html, unsafeCSS } from "lit";
import { customElement, property, query } from 'lit/decorators.js';
import { ZincElement, ZincFormControl } from "@/zinc-element";

import styles from './index.scss?inline';
import { classMap } from "lit/directives/class-map.js";
import { types } from "sass";
import { FormControlController } from "@/form";
import String = types.String;

export type ButtonColor = 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'transparent';
export type ButtonSizes = 'square' | 'x-small' | 'small' | 'normal' | 'medium' | 'large';
export type VerticalAlignments = 'start' | 'center' | 'end';
export type IconPosition = 'left' | 'right';

@customElement('zn-button')
export class Button extends ZincElement implements ZincFormControl
{
  static styles = unsafeCSS(styles);

  private readonly formControlController = new FormControlController(this);

  @query('.button') button: HTMLButtonElement;

  @property({ type: String, reflect: true }) color: ButtonColor = 'primary';
  @property({ type: String, reflect: true }) size: ButtonSizes = 'normal';
  @property({ type: String }) verticalAlign: VerticalAlignments;

  @property({ type: String }) content = '';
  @property({ type: String }) icon: string = '';
  @property({ type: String, attribute: "icon-position" }) iconPosition: IconPosition = 'left';
  @property({ type: String, attribute: "icon-size" }) iconSize: string = '24';
  @property() type: 'button' | 'submit' | 'reset' = 'button';

  @property() name: string;
  @property() value: string;

  @property() form: string;
  @property({ attribute: 'formaction' }) formAction: string;
  @property({ attribute: 'formenctype' }) formEnctype: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
  @property({ attribute: 'formmethod' }) formMethod: 'post' | 'get';
  @property({ attribute: 'formnovalidate', type: Boolean }) formNoValidate: boolean;
  @property({ attribute: 'formtarget' }) formTarget: '_self' | '_blank' | '_parent' | '_top' | string;

  get validity()
  {
    return (this.button as HTMLButtonElement).validity;
  }

  get validationMessage()
  {
    return (this.button as HTMLButtonElement).validationMessage;
  }

  constructor()
  {
    super();
    if(this.size === "x-small" || this.size === "square")
    {
      this.iconSize = "16";
    }
    else if(this.size === "small")
    {
      this.iconSize = '20';
    }
  }

  firstUpdated()
  {
    this.formControlController.updateValidity();
  }

  checkValidity()
  {
    return (this.button as HTMLButtonElement).checkValidity();
  }

  getForm(): HTMLFormElement | null
  {
    return this.formControlController.getForm();
  }

  reportValidity()
  {
    return (this.button as HTMLButtonElement).reportValidity();
  }

  setCustomValidity(message: string)
  {
    (this.button as HTMLButtonElement).setCustomValidity(message);
    this.formControlController.updateValidity();
  }

  private handleClick()
  {
    this.formControlController.submit(this);
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
      <button part="base"
              class=${classMap({
                'button': true,
                'button--with-icon': this.icon,
                'button--with-content': this.content,
              })}
              type=${this.type}
              @click=${this.handleClick}>
        ${this.iconPosition === 'left' ? icon : ''}
        <slot part="label" class="button__label">${this.content}</slot>
        ${this.iconPosition === 'right' ? icon : ''}
      </button>`;

  }
}


