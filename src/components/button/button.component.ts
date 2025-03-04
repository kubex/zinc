import { classMap } from 'lit/directives/class-map.js';
import { property, query, state } from 'lit/decorators.js';
import { type CSSResultGroup, unsafeCSS } from 'lit';
import { LocalizeController } from '../../utilities/localize';
import { html, literal } from 'lit/static-html.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import ZincElement, { ZincFormControl } from '../../internal/zinc-element';
import { FormControlController, validValidityState } from "../../internal/form";
import { HasSlotController } from '../../internal/slot';
import { watch } from "../../internal/watch";

import styles from './button.scss?inline';

/**
 * @summary Buttons represent actions that are available to the user.
 * @documentation https://inc.style/components/button
 * @status stable
 * @since 2.0
 *
 * @dependency zn-icon
 * @dependency zn-spinner
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
    // 'zn-icon': ZnIcon,
    // 'zn-spinner': ZnSpinner
  };

  private readonly formControlController = new FormControlController(this, {
    assumeInteractionOn: ['click']
  });
  private readonly hasSlotController = new HasSlotController(this, '[default]', 'prefix', 'suffix');
  private readonly localize = new LocalizeController(this);

  // Query
  @query('.button') button: HTMLButtonElement | HTMLLinkElement;

  // State
  @state() private hasFocus = false;
  @state() invalid = false;

  // Properties
  @property() title = ''; // Make reactive to pass through

  /** The variant of the button */
  @property({ reflect: true }) color: 'default' | 'secondary' | 'error' | 'info' | 'success' | 'warning' |
    'transparent' | 'star' = 'default';

  /** The size of the button */
  @property({ reflect: true }) size: 'content' | 'x-small' | 'small' | 'medium' | 'large' = 'medium';

  /** The horizontal alignment of the button's content */
  @property({ reflect: true }) verticalAlign: 'top' | 'middle' | 'bottom' = 'middle';

  /** The icon to display in the button */
  @property({ reflect: true }) icon: string = '';

  /** The icon position */
  @property({ reflect: true, attribute: 'icon-position' }) iconPosition: 'left' | 'right' = 'left';

  /** The icon size */
  @property({ reflect: true, attribute: 'icon-size' }) iconSize: string;

  /** Draws the button with a caret. Used to indicate that the button triggers a dropdown menu or similar behaviour */
  @property({ type: Boolean, reflect: true }) caret = false;

  /** Disables the button */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Draws a button in a loading state */
  @property({ type: Boolean, reflect: true }) loading = false;

  /** Draws an outlined button */
  @property({ type: Boolean, reflect: true }) outline = false;

  /** Draws a pill-styles button with rounded edges */
  @property({ type: Boolean, reflect: true }) pill = false;

  /**
   * Draws a circular icon button. When this attribute is present, the button expects a single `<zn-icon>` in the
   * default slot.
   */
  @property({ type: Boolean, reflect: true }) circle = false;

  /**
   * The type of button. Note that the default value is `button` instead of `submit`, which is opposite of how native
   * `<button>` elements behave. When the type is `submit`, the button will submit the surrounding form
   */
  @property() type: 'button' | 'submit' | 'reset' = 'button';

  /**
   * The name of the button, submitted as a name/value pair with form data, but only when this button is the submitter.
   * This attribute is ignored if `href` is present.
   */
  @property() name = '';

  /**
   * The value of the button, submitted as a pair with the button's name as part of the form data, but only when this
   * button is the submitter. This attribute is ignored if `href` is present.
   */
  @property() value = '';

  /** When set, the underlying button will be rendered as an `<a>` element with this `href` instead of a `<button>` */
  @property() href = '';

  /** Tells the browser where to open the link. Only used when `href` is present. */
  @property() target: '_blank' | '_parent' | '_self' | '_top';

  /**
   * When using `href`, this attribute will map to the underlying link's `rel` attribute. Unlike regular links, the
   * default is `noreferrer noopener` to prevent security exploits. However, if you're using `target` to point to a
   * specific tab/window, this will prevent that from working correctly. You can remove or change the default value by
   * setting the attribute to an empty string or a value of your choice, respectively.
   */
  @property() rel = 'noreferrer noopener';

  /** Tells the browser to download the linked file as this filename. Only used when `href` is present. */
  @property() download?: string;

  /**
   * The "form owner" to associate the button with. If omitted, the closest containing form will be used instead. The
   * value of this attribute must be an id of a form in the same document or shadow root as the button.
   */
  @property() form: string;

  /** Used to override the form owner's `action` attribute. */
  @property({ attribute: 'formaction' }) formAction: string;

  /** Used to override the form owner's `enctype` attribute.  */
  @property({ attribute: 'formenctype' })
  formEnctype: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';

  /** Used to override the form owner's `method` attribute.  */
  @property({ attribute: 'formmethod' }) formMethod: 'post' | 'get';

  /** Used to override the form owner's `novalidate` attribute. */
  @property({ attribute: 'formnovalidate', type: Boolean }) formNoValidate: boolean;

  /** Used to override the form owner's `target` attribute. */
  @property({ attribute: 'formtarget' }) formTarget: '_self' | '_blank' | '_parent' | '_top' | string;

  /** Gets the validity state object */
  get validity() {
    if (this.isButton()) {
      return (this.button as HTMLButtonElement).validity;
    }

    return validValidityState;
  }

  /** Gets the validation message */
  get validationMessage() {
    if (this.isButton()) {
      return (this.button as HTMLButtonElement).validationMessage;
    }

    return '';
  }

  private handleBlur() {
    this.hasFocus = false;
    this.emit('zn-blur');
  }

  private handleFocus() {
    this.hasFocus = true;
    this.emit('zn-focus');
  }

  private handleClick() {
    if (this.type === 'submit') {
      this.formControlController.submit(this);
    }

    if (this.type === 'reset') {
      this.formControlController.reset(this);
    }
  }

  private handleInvalid(event: Event) {
    this.formControlController.setValidity(false);
    this.formControlController.emitInvalidEvent(event);
  }

  private isButton() {
    return !this.href;
  }

  private isLink() {
    return !!this.href;
  }

  @watch('disabled', { waitUntilFirstUpdate: true })
  handleDisabledChange() {
    if (this.isButton()) {
      // Disabled form controls are always valid
      this.formControlController.setValidity(this.disabled);
    }
  }

  /** Simulates a click on the button. */
  click() {
    this.button.click();
  }

  /** Sets focus on the button. */
  focus(options?: FocusOptions) {
    this.button.focus(options);
  }

  /** Removes focus from the button. */
  blur() {
    this.button.blur();
  }

  /** Checks for validity but does not show a validation message. Returns `true` when valid and `false` when invalid. */
  checkValidity() {
    if (this.isButton()) {
      return (this.button as HTMLButtonElement).checkValidity();
    }

    return true;
  }

  /** Gets the associated form, if one exists. */
  getForm(): HTMLFormElement | null {
    return this.formControlController.getForm();
  }

  /** Checks for validity and shows the browser's validation message if the control is invalid. */
  reportValidity() {
    if (this.isButton()) {
      return (this.button as HTMLButtonElement).reportValidity();
    }

    return true;
  }

  /** Sets a custom validation message. Pass an empty string to restore validity. */
  setCustomValidity(message: string) {
    if (this.isButton()) {
      (this.button as HTMLButtonElement).setCustomValidity(message);
      this.formControlController.updateValidity();
    }
  }

  render() {
    const isLink = this.isLink();
    const tag = isLink ? literal`a` : literal`button`;

    const defaultSizes = {
      'content': '14',
      'x-small': '14',
      'small': '18',
      'medium': '20',
      'large': '30'
    };

    const iconSize = this.iconSize !== undefined ? this.iconSize : defaultSizes[this.size];

    const icon = this.icon ? html`
      <zn-icon part="icon" class="button__icon" src=${this.icon} size=${iconSize}></zn-icon>` : '';

    return html`
      <${tag}
        class=${classMap({
          button: true,
          'button--default': this.color === 'default',
          'button--secondary': this.color === 'secondary',
          'button--success': this.color === 'success',
          'button--info': this.color === 'info',
          'button--warning': this.color === 'warning',
          'button--error': this.color === 'error',
          'button--star': this.color === 'star',
          'button--transparent': this.color === 'transparent',
          'button--content': this.size === 'content',
          'button--x-small': this.size === 'x-small',
          'button--small': this.size === 'small',
          'button--medium': this.size === 'medium',
          'button--large': this.size === 'large',
          'button--caret': this.caret,
          'button--circle': this.circle,
          'button--disabled': this.disabled,
          'button--focused': this.hasFocus,
          'button--loading': this.loading,
          'button--standard': !this.outline,
          'button--outline': this.outline,
          'button--pill': this.pill,
          'button--rtl': this.localize.dir() === 'rtl',
          'button--with-icon': this.icon,
          'button--has-label': this.hasSlotController.test('[default]'),
          'button--has-prefix': this.hasSlotController.test('prefix'),
          'button--has-suffix': this.hasSlotController.test('suffix')
        })}
        part="base"
        ?disabled=${ifDefined(isLink ? undefined : this.disabled)}
        type=${ifDefined(isLink ? undefined : this.type)}
        title=${this.title /* An empty title prevents browser validation tooltips from appearing on hover */}
        name=${ifDefined(isLink ? undefined : this.name)}
        value=${ifDefined(isLink ? undefined : this.value)}
        href=${ifDefined(isLink && !this.disabled ? this.href : undefined)}
        target=${ifDefined(isLink ? this.target : undefined)}
        download=${ifDefined(isLink ? this.download : undefined)}
        rel=${ifDefined(isLink ? this.rel : undefined)}
        role=${ifDefined(isLink ? undefined : 'button')}
        aria-disabled=${this.disabled ? 'true' : 'false'}
        tabindex=${this.disabled ? '-1' : '0'}
        @blur=${this.handleBlur}
        @focus=${this.handleFocus}
        @invalid=${this.isButton() ? this.handleInvalid : null}
        @click=${this.handleClick}
      >
        <slot name="prefix" part="prefix" class="button__prefix">
          ${this.iconPosition === "left" ? icon : ''}
        </slot>
        <slot part="label" class="button__label"></slot>
        <slot name="suffix" part="suffix" class="button__suffix"></slot>
        ${
          this.caret ? html`
            <zn-icon part="caret" class="button__caret" library="system" src="caret"></zn-icon> ` : ''
        }
        ${this.loading ? html`
          <zn-spinner part="spinner"></zn-spinner>` : ''}
      </${tag}>`;
  }
}
