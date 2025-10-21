import {classMap} from 'lit/directives/class-map.js';
import {type CSSResultGroup, unsafeCSS} from 'lit';
import {FormControlController, validValidityState} from "../../internal/form";
import {HasSlotController} from '../../internal/slot';
import {html, literal} from 'lit/static-html.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {property, query, queryAll} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import ZnDropdown from "../dropdown";
import ZnIcon from "../icon";
import ZnTooltip from "../tooltip";
import type {IconColor} from "../icon";
import type {ZincFormControl} from '../../internal/zinc-element';

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
  private _autoClickTimeout: number | undefined;
  private _fixedWidth: number | null = null;
  private _loadingState = {
    countdown: null as number | null,
    interval: undefined as number | undefined,
  };

  @query('.button') button: HTMLButtonElement;

  @property({}) color: 'default' | 'secondary' | 'error' | 'info' | 'success' | 'warning' |
    'transparent' | 'star' = 'default';
  @property({}) size: 'content' | 'x-small' | 'small' | 'medium' | 'large' = 'medium';
  @property({type: Boolean}) text = false;
  @property({type: Boolean}) outline = false;
  @property({type: Boolean}) disabled = false;
  @property({type: Boolean}) grow = false;
  @property({type: Boolean}) square = false;


  @property({attribute: 'dropdown-closer', type: Boolean}) dropdownCloser = false;

  @property({type: Number}) notification: number;
  @property({attribute: "muted-notifications", type: Boolean}) mutedNotifications = false;

  @property() verticalAlign: 'start' | 'center' | 'end';

  @property() content = '';
  @property() icon: string = '';
  @property() gaid: string = '';
  @property({attribute: "icon-position"}) iconPosition: 'left' | 'right' = 'left';
  @property({attribute: "icon-size"}) iconSize: string;
  @property({attribute: "icon-color"}) iconColor: IconColor;
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

  // Auto Click Specific
  @property({type: Boolean, attribute: 'auto-click'}) autoClick = false;
  @property({type: Number, attribute: 'auto-click-delay'}) autoClickDelay = 2000;
  @property({type: String, attribute: 'loading-text'}) loadingText = 'Loading...';
  @property({
    type: String,
    attribute: 'loading-text-position'
  }) loadingTextPosition: 'left' | 'right' | 'center' | string = 'center';
  @property({type: Boolean}) loading = false;

  @queryAll('.loading-countdown') countdownContainer: HTMLElement[];

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

  disconnectedCallback() {
    super.disconnectedCallback();
    this.teardownAutoClick();
  }

  protected updated(changedProps: Map<string, any>) {
    super.updated(changedProps);
    if (changedProps.has('autoClick')) {
      if (this.autoClick) {
        this.setupAutoClick();
      } else {
        this.teardownAutoClick();
      }
    }
    if (!this.autoClick && this._fixedWidth) {
      this._fixedWidth = null;
      if (this.button) {
        this.button.style.width = '';
      }
    }
    if (this.button) {
      const oldOverlay = this.button.querySelector('.button--loading-fill');
      if (oldOverlay) {
        oldOverlay.remove();
      }

      if (this.loading) {
        // Add loading overlay
        const duration = `${this.autoClickDelay / 1000}s`;
        const overlay = document.createElement('div');
        overlay.classList.add('button--loading-fill');
        overlay.setAttribute('style', `--loading-duration: ${duration}`);

        if (this.button.classList.contains('button--transparent')) {
          overlay.classList.add('button--loading-fill-transparent')
          this.button.classList.add('button--loading-bg-transparent');
        }

        this.button.prepend(overlay);
        this.button.classList.add('button--loading-bg');
      } else {
        this.button.classList.remove('button--loading-bg');
        this.button.classList.remove('button--loading-bg-transparent');
      }

      this.updateCountdownText();
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

    if (this.dropdownCloser) {
      let dropdown: ZnDropdown | null = null;
      let parent: HTMLElement | null = this as HTMLElement | null;
      let count = 0;
      const max = 30; // Break the loop if too deep in the DOM tree

      while (parent && count < max) {
        if (parent instanceof ZnDropdown) {
          dropdown = parent;
          break;
        }
        parent = parent.parentElement || (parent.getRootNode() instanceof ShadowRoot ? (parent.getRootNode() as ShadowRoot).host as HTMLElement : null);
        count++;
      }

      dropdown?.hide();
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

  setupAutoClick() {
    if (!this.button) return;

    if (this._autoClickTimeout) {
      window.clearTimeout(this._autoClickTimeout);
      this._autoClickTimeout = undefined;
    }

    if (this._loadingState.interval) {
      window.clearInterval(this._loadingState.interval);
      this._loadingState.interval = undefined;
    }

    this._fixedWidth = this.button.offsetWidth;
    this.button.style.width = `${this._fixedWidth}px`;

    this.loading = true;
    this._loadingState.countdown = Math.ceil(this.autoClickDelay / 1000);
    this.updateCountdownText();

    this._loadingState.interval = window.setInterval(() => {
      if (this._loadingState.countdown && this._loadingState.countdown > 0) {
        this._loadingState.countdown--;
        this.updateCountdownText();
      }
    }, 1000);

    this._autoClickTimeout = window.setTimeout(() => {
      this.loading = false;
      this._loadingState.countdown = null;
      this.updateCountdownText();

      if (this._loadingState.interval) {
        window.clearInterval(this._loadingState.interval);
        this._loadingState.interval = undefined;
      }

      // this.button?.click();
    }, this.autoClickDelay);
  }

  updateCountdownText() {
    const text = this._loadingState.countdown && this._loadingState.countdown > 0 ? ` (${this._loadingState.countdown}s)` : '';
    if (this.countdownContainer) {
      for (const container of this.countdownContainer) {
        container.textContent = text;
      }
    }
  }

  teardownAutoClick() {
    if (this._autoClickTimeout) {
      window.clearTimeout(this._autoClickTimeout);
      this._autoClickTimeout = undefined;
    }

    if (this._loadingState.interval) {
      window.clearInterval(this._loadingState.interval);
      this._loadingState.interval = undefined;
    }

    this.loading = false;
    this._loadingState.countdown = null;

    if (this.button) {
      this.button.style.width = '';
    }
    this._fixedWidth = null;
  }

  protected render(): unknown {
    const isLink = this._isLink();
    const icon = this.icon ? html`
      <zn-icon part="icon" src="${this.icon}" id="xy2" size="${this.iconSize ? this.iconSize : 16}"
               color="${this.iconColor ? this.iconColor : null}"></zn-icon>` : '';
    const tag = isLink ? literal`a` : literal`button`;
    const loadingDurationStyle = this.loading ? `--loading-duration: ${this.autoClickDelay / 1000}s;` : '';

    let content = html`
      <${tag}
        part="base"
        class="${classMap({
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
          'button--has-notification': this.notification !== undefined && this.notification !== 0,
          'button--muted-notification': this.mutedNotifications || (this.notification !== undefined && this.notification === -2),
          'button--notification-dot': this.notification !== undefined && this.notification < 0,
        })}"
        style="${loadingDurationStyle}${this._fixedWidth ? `width: ${this._fixedWidth}px;` : ''}"
        type="${ifDefined(this.type)}"
        href="${ifDefined(this.href)}"
        target="${ifDefined(isLink ? this.target : undefined)}"
        data-target="${ifDefined(isLink ? this.dataTarget : undefined)}"
        rel="${ifDefined(isLink ? this.rel : undefined)}"
        gaid="${ifDefined(this.gaid)}"
        data-notification="${ifDefined(this.notification)}"
        @click="${this.handleClick}">
        ${this.iconPosition === 'left' ? icon : ''}
        <slot part="label"
              class="${classMap({
                'button__label': true,
                'button__label--hidden': this.loading
              })}"
              style="--loading-duration: ${this.autoClickDelay / 1000}s">
          ${this.content}
        </slot>
        ${this.iconPosition === 'right' ? icon : ''}
        ${this.loading ? html`
          <div class="button--loading-container">
            <span
              class=${classMap({
                'button--loading-text-bottom': true,
                'button--loading-text-bottom-transparent': this.color === 'transparent',
                [`button--loading-text-bottom-${this.loadingTextPosition}`]: !!this.loadingTextPosition,
              })}>
              ${this.loadingText}<span class="loading-countdown"></span>
            </span>
            <span
              class=${classMap({
                'button--loading-text-top': true,
                'button--loading-text-top-transparent': this.color === 'transparent',
                [`button--loading-text-top-${this.loadingTextPosition}`]: !!this.loadingTextPosition,
              })}>
              ${this.loadingText}<span class="loading-countdown"></span>
            </span>
          </div>
        ` : null}
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
