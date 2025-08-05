import {classMap} from 'lit/directives/class-map.js';
import {type CSSResultGroup, unsafeCSS} from 'lit';
import {FormControlController, validValidityState} from "../../internal/form";
import {HasSlotController} from '../../internal/slot';
import {html, literal} from 'lit/static-html.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {property, query} from 'lit/decorators.js';
import type {ZincFormControl} from '../../internal/zinc-element';
import ZincElement from '../../internal/zinc-element';
import ZnIcon from "../icon";
import ZnTooltip from "../tooltip";

import styles from './button.scss';

/**
 * @summary Buttons represent actions that are available to the user.
 * @documentation https://inc.style/components/button
 * @status stable
 * @since 2.0
 *
 * @dependency zn-icon
 * @dependency zn-tooltip
 *
 * @event zn-blur - Emitted when the button loses focus.
 * @event zn-focus - Emitted when the button gains focus.
 * @event zn-invalid - Emitted when the form control has been checked for validity and its constraints aren't satisfied.
 *
 * @slot - The button's label.
 * @slot prefix - A presentational prefix icon or similar element.
 * @slot suffix - A presentational suffix icon or similar element.
 *
 * @csspart base - The component's base wrapper.
 * @csspart prefix - The container that wraps the prefix.
 * @csspart label - The button's label.
 * @csspart suffix - The container that wraps the suffix.
 * @csspart caret - The button's caret icon, an `<zn-icon>` element.
 * @csspart spinner - The spinner that shows when the button is in the loading state.
 */
export default class ZnButton extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-tooltip': ZnTooltip,
    'zn-icon': ZnIcon
  };

  private readonly formControlController = new FormControlController(this);
  private readonly hasSlotController = new HasSlotController(this, '[default]');

  @query('.button') button: HTMLButtonElement;

  @property({}) color: 'default' | 'secondary' | 'error' | 'info' | 'success' | 'warning' |
    'transparent' | 'star' = 'default';
  @property({}) size: 'content' | 'x-small' | 'small' | 'medium' | 'large' = 'medium';
  @property({type: Boolean}) text = false;
  @property({type: Boolean}) outline = false;
  @property({type: Boolean}) disabled = false;
  @property({type: Boolean}) grow = false;
  @property({type: Boolean}) square = false;

  @property({type: Number}) notification: number;

  @property() verticalAlign: 'start' | 'center' | 'end';

  @property() content = '';
  @property() icon: string = '';
  @property() gaid: string = '';
  @property({attribute: "icon-position"}) iconPosition: 'left' | 'right' = 'left';
  @property({attribute: "icon-size"}) iconSize: string;
  @property() type: 'button' | 'submit' | 'reset';

  @property() name: string;
  @property() value: string;

  @property() form: string;
  @property({attribute: 'formaction'}) formAction: string;
  @property({attribute: 'formenctype'}) formEnctype: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
  @property({attribute: 'formmethod'}) formMethod: 'post' | 'get';
  @property({attribute: 'formnovalidate', type: Boolean}) formNoValidate: boolean;
  @property({attribute: 'formtarget'}) formTarget: '_self' | '_blank' | '_parent' | '_top' | string;

  // Link Specific
  @property() href: string;
  @property() target: '_self' | '_blank' | '_parent' | '_top' | string;
  @property({attribute: 'data-target'}) dataTarget: 'modal' | 'slide' | string;
  @property() rel: string = 'noreferrer noopener';

  // Tooltip Specific
  @property() tooltip: string;

  get validity() {
    if (this._isButton() && this.button) {
      return (this.button as HTMLButtonElement).validity;
    }

    return validValidityState;
  }


  get validationMessage() {
    if (this._isButton() && this.button) {
      return (this.button as HTMLButtonElement).validationMessage;
    }

    return '';
  }

  firstUpdated() {
    if (this._isButton()) {
      this.formControlController.updateValidity();
    }
  }

  checkValidity() {
    if (this._isButton() && this.button) {
      return (this.button as HTMLButtonElement).checkValidity();
    }

    return true;
  }

  getForm(): HTMLFormElement | null {
    return this.formControlController.getForm();
  }

  reportValidity() {
    if (this._isButton() && this.button) {
      return (this.button as HTMLButtonElement).reportValidity();
    }

    return true;
  }

  setCustomValidity(message: string) {
    if (this._isButton()) {
      (this.button as HTMLButtonElement).setCustomValidity(message);
      this.formControlController.updateValidity();
    }
  }

  handleClick = () => {
    if (this.disabled) {
      return;
    }

    if (this.type === 'submit') {
      this.formControlController.submit();
    }
  }

  private _isLink() {
    return this.href !== undefined;
  }

  private _isButton() {
    return !this._isLink();
  }

  protected render(): unknown {
    const isLink = this._isLink();

    const icon = this.icon ? html`
      <zn-icon src="${this.icon}" id="xy2" size="${this.iconSize ? this.iconSize : 16}"></zn-icon>` : '';

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
          'button--text': (this.text && !this.outline),
          'button--grow': this.grow,
          'button--standard': !this.outline && !this.text,
          'button--disabled': this.disabled,
          'button--with-icon': this.icon,
          'button--icon-left': this.iconPosition === 'left',
          'button--icon-right': this.iconPosition === 'right',
          'button--with-content': this.hasSlotController.test('[default]') || this.content,
          'button--square': this.square,
          'button--has-notification': this.notification !== undefined && this.notification > 0,
        })}
        type=${ifDefined(this.type)}
        href=${ifDefined(this.href)}
        target=${ifDefined(isLink ? this.target : undefined)}
        data-target=${ifDefined(isLink ? this.dataTarget : undefined)}
        rel=${ifDefined(isLink ? this.rel : undefined)}
        gaid=${ifDefined(this.gaid)}
        data-notification=${ifDefined(this.notification)}
        @click=${this.handleClick}>
        ${this.iconPosition === 'left' ? icon : ''}
        <slot part="label" class="button__label">${this.content}</slot>
        ${this.iconPosition === 'right' ? icon : ''}
      </${tag}>`;

    if (this.tooltip !== undefined) {
      content = html`
        <zn-tooltip placement="top" content="${this.tooltip}">
          ${content}
        </zn-tooltip>`;
    }

    return content;
  }
}
