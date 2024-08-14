import { unsafeCSS } from "lit";
import { customElement, property, query } from 'lit/decorators.js';
import { ZincElement, ZincFormControl } from "@/zinc-element";
import { html, literal } from "lit/static-html.js";
import { classMap } from "lit/directives/class-map.js";
import { FormControlController, validValidityState } from "@/form";
import { HasSlotController } from "@/slot";

import styles from './index.scss?inline';
import { ifDefined } from "lit/directives/if-defined.js";

export type ButtonColor = 'default' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'transparent' | 'star';
export type ButtonSizes = 'content' | 'x-small' | 'small' | 'medium' | 'large';
export type VerticalAlignments = 'start' | 'center' | 'end';
export type IconPosition = 'left' | 'right';

@customElement('zn-button')
export class Button extends ZincElement implements ZincFormControl
{
  static styles = unsafeCSS(styles);

  private readonly formControlController = new FormControlController(this);
  private readonly hasSlotController = new HasSlotController(this, '[default]');

  @query('.button') button: HTMLButtonElement;

  @property({}) color: ButtonColor = 'default';
  @property({}) size: ButtonSizes = 'medium';
  @property({ type: Boolean }) outline = false;
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) grow = false;

  @property() verticalAlign: VerticalAlignments;

  @property() content = '';
  @property() icon: string = '';
  @property() gaid: string = '';
  @property({ attribute: "icon-position" }) iconPosition: IconPosition = 'left';
  @property({ attribute: "icon-size" }) iconSize: string;
  @property() type: 'button' | 'submit' | 'reset';

  @property() name: string;
  @property() value: string;

  @property() form: string;
  @property({ attribute: 'formaction' }) formAction: string;
  @property({ attribute: 'formenctype' }) formEnctype: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
  @property({ attribute: 'formmethod' }) formMethod: 'post' | 'get';
  @property({ attribute: 'formnovalidate', type: Boolean }) formNoValidate: boolean;
  @property({ attribute: 'formtarget' }) formTarget: '_self' | '_blank' | '_parent' | '_top' | string;

  // Link Specific
  @property() href: string;
  @property() target: '_self' | '_blank' | '_parent' | '_top' | string;
  @property({ attribute: 'data-target' }) dataTarget: 'modal' | 'slide' | string;
  @property() rel: string = 'noreferrer noopener';

  // Tooltip Specific
  @property() tooltip: string;

  get validity()
  {
    if(this._isButton() && this.button)
    {
      return (this.button as HTMLButtonElement).validity;
    }

    return validValidityState;
  }


  get validationMessage()
  {
    if(this._isButton() && this.button)
    {
      return (this.button as HTMLButtonElement).validationMessage;
    }

    return '';
  }

  firstUpdated()
  {
    if(this._isButton())
    {
      this.formControlController.updateValidity();
    }
  }

  checkValidity()
  {
    if(this._isButton() && this.button)
    {
      return (this.button as HTMLButtonElement).checkValidity();
    }

    return true;
  }

  getForm(): HTMLFormElement | null
  {
    return this.formControlController.getForm();
  }

  reportValidity()
  {
    if(this._isButton() && this.button)
    {
      return (this.button as HTMLButtonElement).reportValidity();
    }

    return true;
  }

  setCustomValidity(message: string)
  {
    if(this._isButton())
    {
      (this.button as HTMLButtonElement).setCustomValidity(message);
      this.formControlController.updateValidity();
    }
  }

  private handleClick()
  {
    if(this.type === 'submit')
    {
      this.formControlController.submit(this);
    }
  }

  private _isLink()
  {
    return this.href !== undefined;
  }

  private _isButton()
  {
    return !this._isLink();
  }

  protected render(): unknown
  {
    const isLink = this._isLink();
    const defaultSizes = {
      'x-small': '14',
      'small': '18',
      'medium': '20',
      'large': '30'
    };

    const iconSize = this.iconSize !== undefined ? this.iconSize : defaultSizes[this.size];

    const icon = this.icon ? html`
      <zn-icon src="${this.icon}" id="xy2" size="${iconSize}"></zn-icon>` : '';

    const tag = isLink ? literal`a` : literal`button`;

    let content = html`
      <${tag}
        part="base"
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
          'button--content': this.size === 'content',
          'button--x-small': this.size === 'x-small',
          'button--small': this.size === 'small',
          'button--medium': this.size === 'medium',
          'button--large': this.size === 'large',
          'button--outline': this.outline,
          'button--grow': this.grow,
          'button--standard': !this.outline,
          'button--disabled': this.disabled,
          'button--with-icon': this.icon,
          'button--with-content': this.hasSlotController.test('[default]') || this.content,
        })}
        .type=${this.type}
        href=${ifDefined(this.href)}
        target=${ifDefined(isLink ? this.target : undefined)}
        data-target=${ifDefined(isLink ? this.dataTarget : undefined)}
        rel=${ifDefined(isLink ? this.rel : undefined)}
        gaid=${ifDefined(this.gaid)}
        @click=${this.handleClick}
      >
        ${this.iconPosition === 'left' ? icon : ''}
        <slot part="label" class="button__label">${this.content}</slot>
        ${this.iconPosition === 'right' ? icon : ''}
      </${tag}>`;

    if(this.tooltip !== undefined)
    {
      content = html`
        <zn-tooltip placement="top" content="${this.tooltip}">
          ${content}
        </zn-tooltip>`;
    }

    return content;
  }
}


