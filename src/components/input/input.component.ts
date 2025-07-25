import {classMap} from "lit/directives/class-map.js";
import {defaultValue} from "../../internal/default-value";
import {FormControlController} from "../../internal/form";
import {HasSlotController} from "../../internal/slot";
import {html, unsafeCSS} from 'lit';
import {ifDefined} from "lit/directives/if-defined.js";
import {live} from "lit/directives/live.js";
import {LocalizeController} from "../../utilities/localize";
import {property, query, state} from 'lit/decorators.js';
import {watch} from "../../internal/watch";
import ZincElement from '../../internal/zinc-element';
import ZnIcon from "../icon";
import ZnTooltip from "../tooltip";
import type {ZincFormControl} from '../../internal/zinc-element';

import styles from './input.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/input
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-icon
 * @dependency zn-tooltip
 *
 * @event zn-blur - Emitted when the control loses focus.
 * @event zn-change - Emitted when an alteration to the control's value is committed by the user.
 * @event zn-clear - Emitted when the clear button is activated.
 * @event zn-focus - Emitted when the control gains focus.
 * @event zn-input - Emitted when the control receives input.
 * @event zn-invalid - Emitted when the form control has been checked for validity and its constraints aren't satisfied.
 *
 * @slot label - The input's label. Alternatively, you can use the `label` attribute.
 * @slot label-tooltip - Used to add text that is displayed in a tooltip next to the label. Alternatively, you can use the `label-tooltip` attribute.
 * @slot context-note - Used to add contextual text that is displayed above the input, on the right. Alternatively, you can use the `context-note` attribute.
 * @slot prefix - Used to prepend a presentational icon or similar element to the input.
 * @slot suffix - Used to append a presentational icon or similar element to the input.
 * @slot clear-icon - An icon to use in lieu of the default clear icon.
 * @slot show-password-icon - An icon to use in lieu of the default show password icon.
 * @slot hide-password-icon - An icon to use in lieu of the default hide password icon.
 * @slot help-text - Text that describes how to use the input. Alternatively, you can use the `help-text` attribute.
 *
 * @csspart form-control - The form control that wraps the label, input, and help text.
 * @csspart form-control-label - The label's wrapper.
 * @csspart form-control-input - The input's wrapper.
 * @csspart form-control-help-text - The help text's wrapper.
 * @csspart base - The component's base wrapper.
 * @csspart input - The internal `<input>` control.
 * @csspart prefix - The container that wraps the prefix.
 * @csspart clear-button - The clear button.
 * @csspart password-toggle-button - The password toggle button.
 * @csspart suffix - The container that wraps the suffix.
 */
export default class ZnInput extends ZincElement implements ZincFormControl {
  static styles = unsafeCSS(styles);
  static dependencies = {
    'zn-icon': ZnIcon,
    'zn-tooltip': ZnTooltip
  }

  private readonly formControlController = new FormControlController(this, {
    assumeInteractionOn: ['zn-blur', 'zn-input']
  });
  private readonly hasSlotController = new HasSlotController(this, 'help-text', 'label', 'label-tooltip');
  private readonly localize = new LocalizeController(this);

  @query('.input__control') input: HTMLInputElement;

  @state() private hasFocus = false;
  @property() title = "" // make reactive pass through

  private __numberInput = Object.assign(document.createElement('input'), {type: 'number'});
  private __dateInput = Object.assign(document.createElement('input'), {type: 'date'});

  /**
   * The type of input. Works the same as native `<input>` element. But only a subset of types is supported. Defaults
   * to `text`
   */
  @property({reflect: true}) type: 'currency' | 'date' | 'datetime-local' | 'email' | 'number' | 'password' |
    'search' | 'tel' | 'text' | 'time' | 'url' = 'text';

  /** The name of the input, submitted as a name/value pair with form data. */
  @property() name: string = "";

  /** The current value of the input, submitted as a name/value pair with form data. */
  @property() value: any = '';

  /** The default value of the form control. Primarily used for resetting the form control. */
  @defaultValue() defaultValue: string = '';

  /** The inputs size **/
  @property({reflect: true}) size: 'x-small' | 'small' | 'medium' | 'large' = 'medium';

  /** Draws a pill-styled input **/
  @property({type: Boolean, reflect: true}) pill: boolean = false;

  /** The inputs label. If you need to display HTML, use the `label` slot. **/
  @property() label: string = '';

  /** Text that appears in a tooltip next to the label. If you need to display HTML in the tooltip, use the
   * `label-tooltip` slot.
   * **/
  @property({attribute: 'label-tooltip'}) labelTooltip: string = '';

  /**
   * Text that appears above the input, on the right, to add additional context. If you need to display HTML
   * in this text, use the `context-note` slot instead
   */
  @property({attribute: 'context-note'}) contextNote: string = '';

  /** The input's help text. If you need to display HTML, use the `help-text` slot instead. **/
  @property({attribute: 'help-text'}) helpText: string = '';

  /** Adds a clear button when the input is not empty **/
  @property({type: Boolean, reflect: true}) clearable: boolean = false;

  /** Adds the default optional icon for this input type. Currently only types `email` and `tel` have a default
   * optional icon.
   */
  @property({attribute: 'optional-icon', type: Boolean}) optionalIcon: boolean = false;

  /** Disables the input **/
  @property({type: Boolean, reflect: true}) disabled: boolean = false;

  /** Fills the input background white **/
  @property({type: Boolean, reflect: true}) filled: boolean = false;

  /** Placeholder text to show as a hint when the input is empty. */
  @property() placeholder: string = '';

  /** Makes the input read-only **/
  @property({type: Boolean, reflect: true}) readonly: boolean = false;

  /** Adds a button to toggle the passwords visibility, only applies to password types **/
  @property({attribute: 'password-toggle', type: Boolean}) passwordToggle: boolean = false;

  /** Determines whether or no the password is currently visible. Only applies to password types **/
  @property({attribute: 'password-visible', type: Boolean}) passwordVisible: boolean = false;

  /** Hides the browsers built-in increment/decrement spin buttons for number inputs **/
  @property({attribute: 'no-spin-buttons', type: Boolean}) noSpinButtons: boolean = false;

  /**
   * By default, form-controls are associated with the nearest containing `<form>` element. This attribute allows you
   * to place the form control outside a form and associate it with the form that has this `id`. The form must be
   * in the same document or shadow root for this to work.
   */
  @property({reflect: true}) form: string;

  /** Makes the input a required field. */
  @property({type: Boolean, reflect: true}) required = false;

  /** A regular expression pattern to validate input against. */
  @property() pattern: string;

  /** The minimum length of input that will be considered valid. */
  @property({type: Number}) minlength: number;

  /** The maximum length of input that will be considered valid. */
  @property({type: Number}) maxlength: number;

  /** The input's minimum value. Only applies to date and number input types. */
  @property() min: number | string;

  /** The input's maximum value. Only applies to date and number input types. */
  @property() max: number | string;

  /**
   * Specifies the granularity that the value must adhere to, or the special value `any` which means no stepping is
   * implied, allowing any numeric value. Only applies to date and number input types.
   */
  @property() step: number | 'any';

  /** Controls whether and how text input is automatically capitalized as it is entered by the user. */
  @property() autocapitalize: 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters';

  /** Indicates whether the browser's autocorrect feature is on or off. */
  @property() autocorrect: 'off' | 'on';

  /**
   * Specifies what permission the browser has to provide assistance in filling out form field values. Refer to
   * [this page on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete) for available values.
   */
  @property() autocomplete: string;

  /** Indicates that the input should receive focus on page load. */
  @property({type: Boolean}) autofocus: boolean;

  /** Used to customize the label or icon of the Enter key on virtual keyboards. */
  @property() enterkeyhint: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';

  /** Enables spell checking on the input. */
  @property({
    type: Boolean,
    converter: {
      // Allow "true|false" attribute values but keep the property boolean
      fromAttribute: value => (!(!value || value === 'false')),
      toAttribute: value => (value ? 'true' : 'false')
    }
  })
  spellcheck = true;

  /**
   * Tells the browser what type of data will be entered by the user, allowing it to display the appropriate virtual
   * keyboard on supportive devices.
   */
  @property() inputmode: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';

  //
  // NOTE: We use an in-memory input for these getters/setters instead of the one in the template because the properties
  // can be set before the component is rendered.
  //

  /**
   * Gets or sets the current value as `date` object. Returns `null` if the value can't be converted. This will use
   * the native `<input type="{{type}}">` implementation and may result in an error.
   */
  get valueAsDate() {
    this.__dateInput.type = this.type;
    this.__dateInput.value = this.value;
    return this.input?.valueAsDate || this.__dateInput.valueAsDate;
  }

  set valueAsDate(newValue: Date | null) {
    this.__dateInput.type = this.type;
    this.__dateInput.valueAsDate = newValue;
    this.value = this.__dateInput.value;
  }

  /** Gets or sets the current value as a number. Return `null` if the value can't be converted. */
  get valueAsNumber() {
    this.__numberInput.value = this.value;
    return this.input?.valueAsNumber || this.__numberInput.valueAsNumber;
  }

  set valueAsNumber(newValue: number) {
    this.__numberInput.valueAsNumber = newValue;
    this.value = this.__numberInput.value;
  }

  /** Gets the validity state object */
  get validity() {
    return this.input?.validity;
  }

  /** Gets the validation message */
  get validationMessage() {
    return this.input.validationMessage;
  }

  private validateMinMax(): void {
    if (this.type !== 'number' && this.type !== 'date') {
      return;
    }
    if (typeof this.min !== 'undefined' && parseInt(this.value as string) < parseInt(this.min as string)) {
      this.value = this.min.toString();
    }
    if (typeof this.max !== 'undefined' && parseInt(this.value as string) > parseInt(this.max as string)) {
      this.value = this.max.toString();
    }
  }

  private handleBlur() {
    this.hasFocus = false;
    this.validateMinMax();
    this.emit('zn-blur');
  }

  private handleChange() {
    if (this.type === 'currency') {
      this.value = parseFloat(this.input.value as string).toFixed(2)
    } else {
      this.value = this.input.value;
    }

    this.emit('zn-change');
  }

  private handleClearClick(event: MouseEvent) {
    this.value = '';
    this.emit('zn-clear');
    this.emit('zn-input');
    this.emit('zn-change');
    this.input.focus();

    event.stopPropagation();
  }

  private handleFocus() {
    this.hasFocus = true;
    this.emit('zn-focus');
  }

  private handleInput() {
    this.value = this.input.value;
    this.formControlController.updateValidity();
    this.emit('zn-input');
  }

  private handleInvalid(event: Event) {
    this.formControlController.setValidity(false);
    this.formControlController.emitInvalidEvent(event);
  }

  private handleKeyDown(event: KeyboardEvent) {
    const hasModifier = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

    // Pressing enter when focused on the input should submit the form like a native input, be we wait a tick before
    // submitting to allow users to cancel the keydown event if they need to
    if (event.key === 'Enter' && !hasModifier) {
      // When using a Input Method Editor (IME), pressing enter will cause the form to submit unexpectedly. One way
      // to check for this is to look at event.isComposing, which will be true when the IME is open.
      if (!event.defaultPrevented && !event.isComposing) {
        this.formControlController.submit();
      }
    }
  }

  private handlePasswordToggle() {
    this.passwordVisible = !this.passwordVisible;
  }

  private focusInput(event: MouseEvent) {
    if (this.hasFocus) {
      return;
    }

    const target = event.target as HTMLElement;
    if (target.classList.contains('input__prefix') || target.slot === 'prefix' || (target.hasAttribute('part') && target.getAttribute('part') === 'base')) {
      this.handleFocus();
      this.input.focus();
    }
  }

  @watch('disabled', {waitUntilFirstUpdate: true})
  handleDisabledChange() {
    // Disabled form controls are always valid
    this.formControlController.setValidity(this.disabled);
  }

  @watch('step', {waitUntilFirstUpdate: true})
  handleStepChange() {
    // If step changes, the value may become invalid so we need to recheck after the update. We set the new step
    // imperatively so we don't have to wait for the next render to report the updated validity
    this.input.step = String(this.step);
    this.formControlController.updateValidity();
  }

  @watch('value', {waitUntilFirstUpdate: true})
  async handleValueChange() {
    await this.updateComplete;
    this.formControlController.updateValidity();
  }

  /** Sets focus on the input. */
  focus(options?: FocusOptions) {
    this.input.focus(options);
  }

  /** Removes focus from the input. */
  blur() {
    this.input.blur();
  }

  /** Selects all the text in the input. */
  select() {
    this.input.select();
  }

  /** Sets the start and end positions of the text selection (0-based). */
  setSelectionRange(
    selectionStart: number,
    selectionEnd: number,
    selectionDirection: 'forward' | 'backward' | 'none' = 'none'
  ) {
    this.input.setSelectionRange(selectionStart, selectionEnd, selectionDirection);
  }


  /** Replaces a range of text with a new string. */
  setRangeText(
    replacement: string,
    start?: number,
    end?: number,
    selectMode: 'select' | 'start' | 'end' | 'preserve' = 'preserve'
  ) {
    const selectionStart = start ?? this.input.selectionStart!;
    const selectionEnd = end ?? this.input.selectionEnd!;

    this.input.setRangeText(replacement, selectionStart, selectionEnd, selectMode);

    if (this.value !== this.input.value) {
      this.value = this.input.value;
    }
  }

  /** Displays the browser picker for an input element (only works if the browser supports it for the input type). */
  showPicker() {
    if ('showPicker' in HTMLInputElement.prototype) {
      this.input.showPicker();
    }
  }

  /** Increments the value of a numeric input type by the value of the step attribute. */
  stepUp() {
    this.input.stepUp();
    if (this.value !== this.input.value) {
      this.value = this.input.value;
    }
  }

  /** Decrements the value of a numeric input type by the value of the step attribute. */
  stepDown() {
    this.input.stepDown();
    if (this.value !== this.input.value) {
      this.value = this.input.value;
    }
  }

  /** Checks the validity but does not show a validation message. Returns `true` when valid and `false` when invalid. */
  checkValidity(): boolean {
    return this.input.checkValidity();
  }

  /** Gets the associated form, if one exists. */
  getForm(): HTMLFormElement | null {
    return this.formControlController.getForm();
  }

  /** Checks for validity and shows the browser's validation message if the control is invalid. */
  reportValidity() {
    return this.input.reportValidity();
  }

  /** Sets a custom validation message. Pass an empty string to restore validity. */
  setCustomValidity(message: string) {
    this.input.setCustomValidity(message);
    this.formControlController.updateValidity();
  }

  render() {
    const hasLabelSlot = this.hasSlotController.test('label');
    const hasLabelTooltipSlot = this.hasSlotController.test('label-tooltip');
    const hasContextNoteSlot = this.hasSlotController.test('context-note');
    const hasHelpTextSlot = this.hasSlotController.test('help-text');
    const hasLabel = this.label ? true : hasLabelSlot;
    const hasLabelTooltip = this.labelTooltip ? true : hasLabelTooltipSlot;
    const hasContextNote = this.contextNote ? true : hasContextNoteSlot;
    const hasHelpText = this.helpText ? true : hasHelpTextSlot;
    const hasClearIcon = this.clearable && !this.disabled && !this.readonly;
    const hasOptionalIcon = this.optionalIcon;
    const isClearIconVisible = hasClearIcon && (typeof this.value === 'number' || this.value.length > 0)

    return html`
      <div part="form-control"
           class="${classMap({
             'form-control': true,
             'form-control--x-small': this.size === 'x-small',
             'form-control--small': this.size === 'small',
             'form-control--medium': this.size === 'medium',
             'form-control--large': this.size === 'large',
             'form-control--has-label': hasLabel,
             'form-control--has-label-tooltip': hasLabelTooltip,
             'form-control--has-context-note': hasContextNote,
             'form-control--has-help-text': hasHelpText,
           })}">

        <label part="form-control-label" class="form-control__label" for="input"
               aria-hidden=${hasLabel ? 'false' : 'true'}>
          <slot name="label">${this.label}</slot>

          ${hasLabelTooltip
            ? html`
              <zn-tooltip class="form-control--label-tooltip">
                <div slot="content">
                  <slot name="label-tooltip">${this.labelTooltip}</slot>
                </div>
                <zn-icon src="info"></zn-icon>
              </zn-tooltip>`
            : ''}

        </label>

        ${hasContextNote
          ? html`
            <span class="form-control__label-context-note"><slot name="context-note">${this.contextNote}</slot></span>`
          : ''}

        <div part="form-control-input"
             class="form-control-input"
             @click=${this.focusInput}>
          <div part="base"
               class=${classMap({
                 'input': true,
                 'input--standard': true,
                 'input--x-small': this.size === 'x-small',
                 'input--small': this.size === 'small',
                 'input--medium': this.size === 'medium',
                 'input--large': this.size === 'large',
                 'input--pill': this.pill,
                 'input--disabled': this.disabled,
                 'input--filled': this.filled,
                 'input--focused': this.hasFocus,
                 'input--empty': !this.value,
                 'input--no-spin-buttons': this.noSpinButtons && this.type !== 'currency',
               })}>

            <span part="prefix" class="input__prefix">
              ${this.type === 'currency'
                ? html`
                  <zn-icon class="input__prefix-default" src="payments"></zn-icon>`
                : this.type === 'email' && hasOptionalIcon
                  ? html`
                    <zn-icon class="input__prefix-default" src="mail"></zn-icon>`
                  : this.type === 'tel' && hasOptionalIcon
                    ? html`
                      <zn-icon class="input__prefix-default" src="call"></zn-icon>`
                    : ''}
              <slot name="prefix"></slot>
            </span>

            <input
              part="input"
              id="input"
              class="input__control"
              type=${this.type === 'password' && this.passwordVisible ? 'text' : this.type === 'currency' ? 'number' : this.type}
              title=${this.title /* An empty title prevents browser validation tooltips from appearing on hover */}
              name=${ifDefined(this.name)}
              ?disabled=${this.disabled}
              ?readonly=${this.readonly}
              ?required=${this.required}
              placeholder=${ifDefined(this.placeholder)}
              minlength=${ifDefined(this.minlength)}
              maxlength=${ifDefined(this.maxlength)}
              min=${ifDefined(this.min)}
              max=${ifDefined(this.max)}
              step=${ifDefined(this.step)}
              .value=${live(this.value)}
              autocapitalize=${ifDefined(this.autocapitalize)}
              autocomplete=${ifDefined(this.autocomplete)}
              autocorrect=${ifDefined(this.autocorrect)}
              ?autofocus=${this.autofocus}
              spellcheck=${this.spellcheck}
              pattern=${ifDefined(this.pattern)}
              enterkeyhint=${ifDefined(this.enterkeyhint)}
              inputmode=${ifDefined(this.inputmode)}
              aria-describedby="help-text"
              @change=${this.handleChange}
              @input=${this.handleInput}
              @invalid=${this.handleInvalid}
              @keydown=${this.handleKeyDown}
              @focus=${this.handleFocus}
              @blur=${this.handleBlur}
            />

            ${hasClearIcon
              ? html`
                <button
                  part="clear-button"
                  class=${classMap({
                    input__clear: true,
                    'input__clear--visible': isClearIconVisible
                  })}
                  type="button"
                  aria-label=${this.localize.term('clearEntry')}
                  @click=${this.handleClearClick}
                  tabindex="-1">
                  <slot name="clear-icon">
                    <zn-icon src="cancel"></zn-icon>
                  </slot>
                </button>`
              : ''}

            ${this.passwordToggle && !this.disabled
              ? html`
                <button
                  part="password-toggle-button"
                  class="input__password-toggle"
                  type="button"
                  aria-label=${this.localize.term(this.passwordVisible ? 'hidePassword' : 'showPassword')}
                  @click=${this.handlePasswordToggle}
                  tabindex="-1">
                  ${this.passwordVisible
                    ? html`
                      <slot name="show-password-icon">
                        <zn-icon src="visibility_off"></zn-icon>
                      </slot>
                    `
                    : html`
                      <slot name="hide-password-icon">
                        <zn-icon src="visibility"></zn-icon>
                      </slot>
                    `}
                </button>`
              : ''}

            <span part="suffix" class="input__suffix">
              <slot name="suffix"></slot>
            </span>
          </div>
        </div>

        <div
          part="form-control-help-text"
          id="help-text"
          class="form-control__help-text"
          aria-hidden=${hasHelpText ? 'false' : 'true'}>
          <slot name="help-text">${this.helpText}</slot>
        </div>

      </div>`
  }
}
