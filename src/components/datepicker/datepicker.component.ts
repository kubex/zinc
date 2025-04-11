import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {defaultValue} from "../../internal/default-value";
import {FormControlController} from "../../internal/form";
import {HasSlotController} from "../../internal/slot";
import {ifDefined} from "lit/directives/if-defined.js";
import {live} from "lit/directives/live.js";
import {property, query, state} from 'lit/decorators.js';
import {watch} from "../../internal/watch";
import AirDatepicker, {type AirDatepickerLocale} from "air-datepicker";
import ZincElement, {ZincFormControl} from '../../internal/zinc-element';
import ZnIcon from "../icon";
import ZnTooltip from "../tooltip";

import styles from './datepicker.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/datepicker
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-example
 *
 * @event zn-event-name - Emitted as an example.
 *
 * @slot - The default slot.
 * @slot example - An example slot.
 *
 * @csspart base - The component's base wrapper.
 *
 * @cssproperty --example - An example CSS custom property.
 */
export default class ZnDatepicker extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);

  static dependencies = {
    'zn-icon': ZnIcon,
    'zn-tooltip': ZnTooltip
  }

  private readonly formControlController = new FormControlController(this, {
    assumeInteractionOn: ['zn-blur', 'zn-input']
  });
  private readonly hasSlotController = new HasSlotController(this, 'help-text', 'label', 'label-tooltip');

  @query('.input__control') input: HTMLInputElement;

  @state() private hasFocus = false;

  @property() title = "" // make reactive pass through

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
  @property({reflect: true}) size: 'small' | 'medium' | 'large' = 'medium';

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

  /** Disables the input **/
  @property({type: Boolean, reflect: true}) disabled: boolean = false;

  /** Placeholder text to show as a hint when the input is empty. */
  @property() placeholder: string = '';

  /** Makes the input read-only **/
  @property({type: Boolean, reflect: true}) readonly: boolean = false;

  /**
   * By default, form-controls are associated with the nearest containing `<form>` element. This attribute allows you
   * to place the form control outside a form and associate it with the form that has this `id`. The form must be
   * in the same document or shadow root for this to work.
   */
  @property({reflect: true}) form: string;

  /** Makes the input a required field. */
  @property({type: Boolean, reflect: true}) required = false;

  /** Makes the input a range picker. **/
  @property({type: Boolean}) range = false;

  private _instance: AirDatepicker<HTMLInputElement>;


  /** Gets the validity state object */
  get validity() {
    return this.input?.validity;
  }

  /** Gets the validation message */
  get validationMessage() {
    return this.input.validationMessage;
  }

  @watch('disabled', {waitUntilFirstUpdate: true})
  handleDisabledChange() {
    // Disabled form controls are always valid
    this.formControlController.setValidity(this.disabled);
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

  init() {
    if (this._instance) {
      if (Object.prototype.hasOwnProperty.call(this._instance, 'destroy')) {
        this._instance.destroy();
      }
    }

    const inputElement = this.shadowRoot?.querySelector('input') as HTMLInputElement;
    if (inputElement) {
      this._instance = new AirDatepicker(inputElement, {
        locale: enLocale,
        range: this.range
      });
    }
  }

  private handleInput() {
    this.value = this.input.value;
    this.formControlController.updateValidity();
    this.emit('zn-input');
  }

  private handleChange() {
    this.value = this.input.value;
    this.emit('zn-change');
  }

  private handleInvalid(event: Event) {
    this.formControlController.setValidity(false);
    this.formControlController.emitInvalidEvent(event);
  }

  protected updated(_changedProperties: PropertyValues) {
    super.updated(_changedProperties);
    this.init();
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

    return html`
      <div part="form-control"
           class="${classMap({
             'form-control': true,
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

        <div part="form-control-input" class="form-control-input">
          <div part="base"
               class=${classMap({
                 'input': true,
                 'input--standard': true,
                 'input--small': this.size === 'small',
                 'input--medium': this.size === 'medium',
                 'input--large': this.size === 'large',
                 'input--disabled': this.disabled,
                 'input--focused': this.hasFocus,
                 'input--empty': !this.value,
               })}>

            <span part="prefix" class="input__prefix">
              <span class="input__prefix-default">
                <zn-icon src="calendar_month" size="18"></zn-icon>
              </span>
              <slot name="prefix"></slot>
            </span>

            <input id="date-picker"
                   class="input__control"
                   type="text"
                   title=${this.title /* An empty title prevents browser validation tooltips from appearing on hover */}
                   name=${ifDefined(this.name)}
                   ?disabled=${this.disabled}
                   ?readonly=${this.readonly}
                   ?required=${this.required}
                   placeholder=${ifDefined(this.placeholder)}
                   .value=${live(this.value)}
                   ?autofocus=${this.autofocus}
                   spellcheck=${this.spellcheck}
                   aria-describedby="help-text"
                   @change=${this.handleChange}
                   @input="${this.handleInput}"
                   @invalid=${this.handleInvalid}>

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

const enLocale: Partial<AirDatepickerLocale> = {
  days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  today: 'Today',
  clear: 'Clear',
  dateFormat: 'MM/dd/yyyy',
  timeFormat: 'hh:ii aa',
  firstDay: 0
};
