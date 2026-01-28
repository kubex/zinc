import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {defaultValue} from "../../internal/default-value";
import {FormControlController} from "../../internal/form";
import {HasSlotController} from "../../internal/slot";
import {ifDefined} from "lit/directives/if-defined.js";
import {live} from "lit/directives/live.js";
import {property, query, state} from 'lit/decorators.js';
import {watch} from "../../internal/watch";
import AirDatepicker, {type AirDatepickerLocale, type AirDatepickerOptions} from "air-datepicker";
import ZincElement from '../../internal/zinc-element';
import ZnIcon from "../icon";
import ZnTooltip from "../tooltip";
import type {ZincFormControl} from '../../internal/zinc-element';

import styles from './datepicker.scss';

/**
 * @summary A date picker component with calendar popup and input validation.
 * @documentation https://zinc.style/components/datepicker
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-icon
 * @dependency zn-tooltip
 *
 * @event zn-change - Emitted when the date value changes.
 * @event zn-input - Emitted when the input value changes.
 * @event zn-blur - Emitted when the input loses focus.
 * @event zn-focus - Emitted when the input gains focus.
 *
 * @slot label - The datepicker's label. Alternatively, you can use the `label` attribute.
 * @slot label-tooltip - Tooltip content for the label. Alternatively, you can use the `label-tooltip` attribute.
 * @slot context-note - Additional context text displayed above the input. Alternatively, you can use the `context-note` attribute.
 * @slot help-text - Help text displayed below the input. Alternatively, you can use the `help-text` attribute.
 * @slot prefix - Content to display before the input (in addition to the default calendar icon).
 * @slot suffix - Content to display after the input.
 *
 * @csspart base - The component's base wrapper.
 * @csspart form-control - The form control wrapper.
 * @csspart form-control-label - The label element.
 * @csspart form-control-input - The input wrapper.
 * @csspart form-control-help-text - The help text element.
 *
 * @property format - Date format using AirDatepicker tokens. Default: 'dd/MM/yyyy'
 *   Supported formats:
 *   - dd/MM/yyyy (31/12/2024) - Default
 *   - MM/dd/yyyy (12/31/2024)
 *   - yyyy-MM-dd (2024-12-31)
 *   - dd-MM-yyyy (31-12-2024)
 *   - yyyy/MM/dd (2024/12/31)
 *
 * @cssproperty --zn-input-* - Inherited input component CSS custom properties.
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

  @property({type: Boolean, reflect: true}) flush = false;

  /** Makes the input a required field. */
  @property({type: Boolean, reflect: true}) required = false;

  /** Makes the input a range picker. **/
  @property({type: Boolean}) range = false;

  /** Disallows selecting past dates. **/
  @property({type: Boolean, attribute: 'disable-past-dates'}) disablePastDates = false;

  /** Minimum date that can be selected. Overrides disable-past-dates if both are set. Accepts Date object or date string. **/
  @property({attribute: 'min-date'}) minDate?: string | Date;

  /** Maximum date that can be selected. Accepts Date object or date string. **/
  @property({attribute: 'max-date'}) maxDate?: string | Date;

  /**
   * Date format for display and input. Uses AirDatepicker format tokens.
   *
   * Common formats:
   * - 'dd/MM/yyyy' (31/12/2024) - Default, European style
   * - 'MM/dd/yyyy' (12/31/2024) - US style
   * - 'yyyy-MM-dd' (2024-12-31) - ISO style
   * - 'dd-MM-yyyy' (31-12-2024) - Alternative European
   * - 'yyyy/MM/dd' (2024/12/31) - Alternative ISO
   *
   * Format tokens:
   * - dd: Day with leading zero (01-31)
   * - MM: Month with leading zero (01-12)
   * - yyyy: Full year (2024)
   */
  @property() format: string = 'MM/dd/yyyy';

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

    // Sync value with AirDatepicker instance
    if (this._instance && this.value) {
      const date = this.parseDate(String(this.value));
      if (date) {
        this._instance.selectDate(date, {silent: true});
      }
    } else if (this._instance && !this.value) {
      this._instance.clear({silent: true});
    }
  }

  @watch('format', {waitUntilFirstUpdate: true})
  @watch('range', {waitUntilFirstUpdate: true})
  @watch('minDate', {waitUntilFirstUpdate: true})
  @watch('maxDate', {waitUntilFirstUpdate: true})
  @watch('disablePastDates', {waitUntilFirstUpdate: true})
  handleDatepickerOptionsChange() {
    this.init();
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
      const options: AirDatepickerOptions = {
        locale: enLocale,
        dateFormat: this.format,
        range: this.range,
        toggleSelected: false,
        onSelect: ({date}) => {
          this.handleChange();
          // Blur the input after selection to prevent invisible keyboard navigation
          if (date && !this.range) {
            // For single date selection, blur immediately
            this.input.blur();
          } else if (date && this.range && Array.isArray(date) && date.length === 2) {
            // For range selection, blur only after both dates are selected
            this.input.blur();
          }
        }
      };

      if (this.minDate) {
        options.minDate = typeof this.minDate === 'string' ? new Date(this.minDate) : this.minDate;
      } else if (this.disablePastDates) {
        options.minDate = this.normalizeDate(new Date());
      }

      if (this.maxDate) {
        options.maxDate = typeof this.maxDate === 'string' ? new Date(this.maxDate) : this.maxDate;
      }

      this._instance = new AirDatepicker(inputElement, options);
    }
  }

  private handleInput(event?: InputEvent) {
    const originalValue = this.input.value;
    const cursorPosition = this.input.selectionStart || 0;
    const separator = this.getFormatSeparator();

    // Remove any invalid characters (keep only digits and the separator)
    const validCharPattern = new RegExp(`[^0-9${this.escapeRegex(separator)}]`, 'g');
    const cleanedValue = originalValue.replace(validCharPattern, '');
    const formattedValue = this.autoFormatDate(cleanedValue, separator);

    if (originalValue !== formattedValue) {
      this.input.value = formattedValue;

      // Adjust the cursor position if a separator was auto-inserted
      if (formattedValue.length > originalValue.length && event?.inputType === 'insertText') {
        const newCursorPos = cursorPosition + (formattedValue.length - originalValue.length);
        this.input.setSelectionRange(newCursorPos, newCursorPos);
      } else {
        this.input.setSelectionRange(cursorPosition, cursorPosition);
      }
    }

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

  private handleKeyDown(event: KeyboardEvent) {
    if (this._instance && this._instance.visible) {
      return;
    }

    // Allow navigation and control keys
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];

    // Allow Ctrl/Cmd shortcuts
    if (event.ctrlKey || event.metaKey) {
      return;
    }

    // Allow allowed navigation keys
    if (allowedKeys.includes(event.key)) {
      return;
    }

    // Allow digits and the format separator
    const separator = this.getFormatSeparator();
    const allowedPattern = new RegExp(`^[0-9${this.escapeRegex(separator)}]$`);

    if (allowedPattern.test(event.key)) {
      return;
    }

    event.preventDefault();
  }

  private handlePaste(event: ClipboardEvent) {
    const pastedText = event.clipboardData?.getData('text') || '';

    // Only allow digits, the format separator, and whitespace
    const separator = this.getFormatSeparator();
    const allowedPattern = new RegExp(`^[0-9${this.escapeRegex(separator)}\\s]*$`);

    if (!allowedPattern.test(pastedText)) {
      event.preventDefault();
    }
  }

  private handleBlur() {
    if (this._instance && this._instance.visible) {
      return;
    }

    if (!this.input.value || this.input.value.trim() === '') {
      return;
    }

    if (!this.isValidDateString(this.input.value)) {
      this.clearInvalidDate();
      return;
    }

    const date = this.parseDate(this.input.value);
    if (date && !this.isDateInRange(date)) {
      this.clearInvalidDate();
      return;
    }

    // Sync valid typed date with AirDatepicker instance
    if (date && this._instance) {
      this._instance.selectDate(date);
    }
  }

  private isValidDateString(value: string): boolean {
    const parsed = this.parseDateString(value);
    if (!parsed) {
      return false;
    }

    const {day, month, year} = parsed;
    const date = new Date(year, month - 1, day);

    // Verify the date is valid and wasn't silently corrected
    return date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day;
  }

  private parseDate(value: string): Date | null {
    const parsed = this.parseDateString(value);
    if (!parsed) {
      return null;
    }

    const {day, month, year} = parsed;
    const date = new Date(year, month - 1, day);
    return this.normalizeDate(date);
  }

  private parseDateString(value: string): { day: number; month: number; year: number } | null {
    const separator = this.getFormatSeparator();

    // Create regex pattern based on format
    // Convert AirDatepicker format tokens to regex
    const escapedSeparator = this.escapeRegex(separator);
    const formatPattern = this.format
      .replace(/dd/g, '(\\d{1,2})')
      .replace(/MM/g, '(\\d{1,2})')
      .replace(/yyyy/g, '(\\d{4})')
      .replace(new RegExp(escapedSeparator, 'g'), escapedSeparator);

    const regex = new RegExp(`^${formatPattern}$`);
    const match = value.match(regex);

    if (!match) {
      return null;
    }

    // Determine which capture group corresponds to which date part
    const formatParts = this.format.split(separator);
    let dayIndex = -1;
    let monthIndex = -1;
    let yearIndex = -1;

    formatParts.forEach((part, index) => {
      if (part === 'dd') dayIndex = index + 1;
      if (part === 'MM') monthIndex = index + 1;
      if (part === 'yyyy') yearIndex = index + 1;
    });

    if (dayIndex === -1 || monthIndex === -1 || yearIndex === -1) {
      return null;
    }

    return {
      day: parseInt(match[dayIndex]),
      month: parseInt(match[monthIndex]),
      year: parseInt(match[yearIndex])
    };
  }

  private isDateInRange(date: Date): boolean {
    let minDate: Date | undefined;
    let maxDate: Date | undefined;

    // Determine minDate
    if (this.minDate) {
      minDate = typeof this.minDate === 'string' ? new Date(this.minDate) : new Date(this.minDate);
      this.normalizeDate(minDate);
    } else if (this.disablePastDates) {
      minDate = this.normalizeDate(new Date());
    }

    // Determine maxDate
    if (this.maxDate) {
      maxDate = typeof this.maxDate === 'string' ? new Date(this.maxDate) : new Date(this.maxDate);
      this.normalizeDate(maxDate);
    }

    return !((minDate && date < minDate) || (maxDate && date > maxDate));
  }

  private clearInvalidDate() {
    this.input.value = '';
    this.value = '';
    if (this._instance) {
      this._instance.clear();
    }
    this.formControlController.updateValidity();
  }

  private getFormatSeparator(): string {
    const match = this.format.match(/[^dMy]/);
    return match ? match[0] : '/';
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private normalizeDate(date: Date): Date {
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private autoFormatDate(value: string, separator: string): string {
    const digitsOnly = value.replace(new RegExp(`\\${separator}`, 'g'), '');

    // Get format structure (e.g., "dd/MM/yyyy" -> [2, 2, 4])
    const formatParts = this.format.split(separator);
    const lengths = formatParts.map(part => part.length);

    let formatted = '';
    let digitIndex = 0;

    for (let i = 0; i < lengths.length; i++) {
      const partLength = lengths[i];
      const partValue = digitsOnly.substring(digitIndex, digitIndex + partLength);

      if (partValue) {
        formatted += partValue;
        digitIndex += partLength;

        if (i < lengths.length - 1 && digitIndex < digitsOnly.length) {
          formatted += separator;
        }
      }
    }

    return formatted;
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

        <div part="form-control-input" class=${classMap({
          "form-control-input": true,
          "form-control-input--flush": this.flush
        })}>
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
                   autocomplete="off"
                   ?disabled=${this.disabled}
                   ?readonly=${this.readonly}
                   ?required=${this.required}
                   placeholder=${ifDefined(this.placeholder)}
                   .value=${live(this.value)}
                   ?autofocus=${this.autofocus}
                   spellcheck=${this.spellcheck}
                   aria-describedby="help-text"
                   @change=${this.handleChange}
                   @input=${this.handleInput}
                   @invalid=${this.handleInvalid}
                   @keydown=${this.handleKeyDown}
                   @paste=${this.handlePaste}
                   @blur=${this.handleBlur}>

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
