import { classMap } from "lit/directives/class-map.js";
import { type CSSResultGroup, html, type PropertyValues, unsafeCSS } from 'lit';
import { defaultValue } from "../../internal/default-value";
import { FormControlController } from "../../internal/form";
import { HasSlotController } from "../../internal/slot";
import { ifDefined } from "lit/directives/if-defined.js";
import { live } from "lit/directives/live.js";
import { property, query, state } from 'lit/decorators.js';
import ZincElement, { type ZincFormControl } from '../../internal/zinc-element';

import styles from './toggle.scss';

/**
 * @summary Toggles allow the user to switch an option on or off.
 * @documentation https://zinc.style/components/toggle
 * @status stable
 * @since 1.0
 *
 * @dependency zn-tooltip
 *
 * @event zn-input - Emitted when the toggle receives input.
 *
 * @slot - The toggle's label.
 * @slot description - A description of the toggle's label. Alternatively, you can use the `description` attribute.
 * @slot help-text - Text that describes how to use the toggle. Alternatively, you can use the `help-text` attribute.
 *
 * @csspart base - The component's base wrapper containing the toggle switch.
 * @csspart control - The toggle switch control (the circular button that slides).
 * @csspart description - The container that wraps the toggle's description.
 *
 * @cssproperty --zn-toggle-margin - The margin around the toggle switch. Defaults to `8px 0`.
 */
export default class ZnToggle extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);

  private readonly hasSlotController = new HasSlotController(this, 'help-text', 'description');

  private readonly formControlController = new FormControlController(this, {
    value: (control: ZnToggle) => (control.checked ? control.value || 'on' : undefined),
    defaultValue: (control: ZnToggle) => control.defaultChecked,
    setValue: (control: ZnToggle, checked: boolean) => (control.checked = checked)
  });

  @query('input[type="checkbox"]') input: HTMLInputElement;

  @state() hasFocus: boolean = false;

  @property() title: string = "";

  @property() name: string = "";

  @property() value: string;

  @property({ attribute: 'fallback' }) fallbackValue: string = '';

  @property({ reflect: true }) size: 'small' | 'medium' | 'large' = 'medium';

  @property({ type: Boolean, reflect: true }) disabled: boolean = false;

  @property({ type: Boolean, reflect: true }) checked: boolean = false;

  @defaultValue('checked') defaultChecked = false;

  @property({ reflect: true }) form = '';

  @property({ type: Boolean, reflect: true }) required = false;

  @property({ attribute: 'help-text' }) helpText = "";

  @property({ type: Boolean, attribute: 'trigger-submit' }) triggerSubmit = false;

  @property({ attribute: "on-text" }) onText: string = '';

  @property({ attribute: "off-text" }) offText: string = '';

  @property() label: string = '';

  /** The toggle's description, displayed under the label. If you need to display HTML, use the `description` slot instead. */
  @property() description: string = '';

  @property({ attribute: 'label-position', reflect: true }) labelPosition: 'top' | 'left' | 'right' = 'top';

  @property({ type: Boolean }) inline: boolean = false;

  get validity() {
    return this.input?.validity;
  }

  get validationMessage() {
    return this.input.validationMessage;
  }

  firstUpdated(_changedProperties: PropertyValues) {
    this.formControlController.updateValidity();
    super.firstUpdated(_changedProperties);
  }

  private handleBlur() {
    this.hasFocus = false;
  }

  private handleInvalid(event: Event) {
    this.formControlController.setValidity(false);
    this.formControlController.emitInvalidEvent(event);
  }

  private handleInput() {
    this.value = this.input.value;
    this.formControlController.updateValidity();
    this.emit('zn-input');
  }

  private handleClick() {
    this.checked = !this.checked;
    if (this.triggerSubmit) {
      this.formControlController.submit();
    }
  }

  private handleFocus() {
    this.hasFocus = true;
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.checked = false;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.checked = true;
    }
  }

  // Public API methods

  click() {
    this.input.click();
  }

  focus(options?: FocusOptions) {
    this.input.focus(options);
  }

  blur() {
    this.input.blur();
  }

  checkValidity() {
    return this.input.checkValidity();
  }

  getForm(): HTMLFormElement | null {
    return this.formControlController.getForm();
  }

  reportValidity() {
    return this.input.reportValidity();
  }

  setCustomValidity(message: string) {
    this.input.setCustomValidity(message);
    this.formControlController.updateValidity();
  }

  // End Public API methods

  render() {
    let fallback = html``;
    if (this.fallbackValue !== '') {
      fallback = html`
        <input type="hidden"
               name=${this.name}
               value=${this.fallbackValue}
        />`;
    }

    const tooltipContent = this.checked ? this.onText : this.offText;
    const showTooltip = !!tooltipContent;
    const hasHelpText = this.helpText ? true : this.hasSlotController.test('help-text');
    const hasDescription = this.description ? true : this.hasSlotController.test('description');

    const toggle = html`
      <div class="switch__input-wrapper" part="base">
        ${fallback}
        <input
          class="switch__input"
          type="checkbox"
          title=${this.title}
          name=${this.name}
          value=${ifDefined(this.value)}
          .checked=${live(this.checked)}
          .disabled=${this.disabled}
          .required=${this.required}
          role="switch"
          aria-checked=${this.checked ? 'true' : 'false'}
          aria-describedby="description help-text"
          @click=${this.handleClick}
          @input=${this.handleInput}
          @invalid=${this.handleInvalid}
          @blur=${this.handleBlur}
          @focus=${this.handleFocus}
          @keydown=${this.handleKeyDown}
        />
        <span part="control" class="switch__control"></span>
      </div>`;

    return html`
      <div class="${classMap({
        'form-control': true,
        'form-control--small': this.size === 'small',
        'form-control--medium': this.size === 'medium',
        'form-control--large': this.size === 'large',
        'form-control--has-help-text': hasHelpText,
        'switch__wrapper': true,
        'switch__wrapper--has-description': hasDescription,
        'switch__wrapper--disabled': this.disabled,
        'switch__wrapper--has-focus': this.hasFocus,
        'switch__wrapper--small': this.size === 'small',
        'switch__wrapper--medium': this.size === 'medium',
        'switch__wrapper--large': this.size === 'large',
        'switch__wrapper--inline': this.inline,
        'switch__wrapper--label-left': this.labelPosition === 'left',
        'switch__wrapper--label-right': this.labelPosition === 'right'
      })}">
        <label>
          ${this.label || hasDescription ? html`
            <div class="switch__label-wrapper">
              ${this.label ? html`<p class="switch-label">${this.label}</p>` : ''}
              <div part="description"
                   id="description"
                   class="switch__description"
                   aria-hidden=${hasDescription ? 'false' : 'true'}>
                <slot name="description">${this.description}</slot>
              </div>
            </div>` : ''}
          ${!showTooltip ? html`
            ${toggle}` : html`
            <zn-tooltip content="${tooltipContent}">
              ${toggle}
            </zn-tooltip>`}
        </label>
        <div part="form-control-help-text"
             id="help-text"
             class="form-control__help-text"
             aria-hidden=${hasHelpText ? 'false' : 'true'}>
          <slot name="help-text">${this.helpText}</slot>
        </div>
      </div>`;
  }
}
