import { html, unsafeCSS } from "lit";
import { customElement, property, query } from 'lit/decorators.js';
import { ZincElement, ZincFormControl } from "@/zinc-element";

import styles from './index.scss?inline';
import { classMap } from "lit/directives/class-map.js";
import { FormControlController } from "@/form";
import { HasSlotController } from "@/slot";

export type ButtonColor = 'default' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'transparent' | 'star';
export type ButtonSizes = 'x-small' | 'small' | 'medium' | 'large';
export type VerticalAlignments = 'start' | 'center' | 'end';
export type IconPosition = 'left' | 'right';

@customElement('zn-button')
export class Button extends ZincElement implements ZincFormControl
{
  static styles = unsafeCSS(styles);

  private readonly formControlController = new FormControlController(this);
  private readonly hasSlotController = new HasSlotController(this, '[default]');

  @query('.button') button: HTMLButtonElement;

  @property({ type: String, reflect: true }) color: ButtonColor = 'default';
  @property({ type: String, reflect: true }) size: ButtonSizes = 'medium';
  @property({ type: Boolean, reflect: true }) outline = false;
  @property({ type: Boolean, reflect: true }) disabled = false;

  @property({ type: String }) verticalAlign: VerticalAlignments;

  @property() content = '';
  @property() icon: string = '';
  @property({ attribute: "icon-position" }) iconPosition: IconPosition = 'left';
  @property({ attribute: "icon-size" }) iconSize: string;
  @property({ reflect: true }) type: 'button' | 'submit' | 'reset';

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
    if(this.type === 'submit')
    {
      this.formControlController.submit(this);
    }
  }

  protected render(): unknown
  {
    const defaultSizes = {
      'x-small': '14',
      'small': '18',
      'medium': '20',
      'large': '30'
    };

    const iconSize = this.iconSize !== undefined ? this.iconSize : defaultSizes[this.size];

    const icon = this.icon ? html`
      <zn-icon src="${this.icon}" id="xy2" size="${iconSize}"></zn-icon>` : '';


    return html`
      <button part="base"
              class=${classMap({
                'button': true,
                'button--default': this.color === 'default',
                'button--secondary': this.color === 'secondary',
                'button--error': this.color === 'error',
                'button--info': this.color === 'info',
                'button--success': this.color === 'success',
                'button--warning': this.color === 'warning',
                'button--transparent': this.color === 'transparent',
                'button--star': this.color === 'star',
                'button--x-small': this.size === 'x-small',
                'button--small': this.size === 'small',
                'button--medium': this.size === 'medium',
                'button--large': this.size === 'large',
                'button--outline': this.outline,
                'button--standard': !this.outline,
                'button--disabled': this.disabled,
                'button--with-icon': this.icon,
                'button--with-content': this.hasSlotController.test('[default]') || this.content,
              })}
              .type=${this.type}
              @click=${this.handleClick}>
        ${this.iconPosition === 'left' ? icon : ''}
        <slot part="label" class="button__label">${this.content}</slot>
        ${this.iconPosition === 'right' ? icon : ''}
      </button>`;

  }
}


