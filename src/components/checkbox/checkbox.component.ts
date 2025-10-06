import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {defaultValue} from "../../internal/default-value";
import {FormControlController} from "../../internal/form";
import {HasSlotController} from "../../internal/slot";
import {ifDefined} from "lit/directives/if-defined.js";
import {live} from "lit/directives/live.js";
import {property, query, state} from 'lit/decorators.js';
import {watch} from '../../internal/watch';
import type {ZincFormControl} from '../../internal/zinc-element';
import ZincElement from '../../internal/zinc-element';
import ZnIcon from "../icon";

import styles from './checkbox.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/checkbox
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-icon
 *
 * @slot - The checkbox's label.
 * @slot description - A description of the checkbox's label. Serves as help text for a checkbox item. Alternatively, you can use the `description` attribute.
 *  @slot selected-content - Use to nest rich content (like an input) inside a selected checkbox item. Use only with the contained style.
 *
 * @event zn-blur - Emitted when the checkbox loses focus.
 * @event zn-change - Emitted when the checked state changes.
 * @event zn-focus - Emitted when the checkbox gains focus.
 * @event zn-input - Emitted when the checkbox receives input.
 * @event zn-invalid - Emitted when the form control has been checked for validity and its constraints aren't satisfied.
 *
 * @csspart base - The component's base wrapper.
 * @csspart control - The square container that wraps the checkbox's checked state.
 * @csspart control--checked - Matches the control part when the checkbox is checked.
 * @csspart control--indeterminate - Matches the control part when the checkbox is indeterminate.
 * @csspart checked-icon - The checked icon, an `<zn-icon>` element.
 * @csspart indeterminate-icon - The indeterminate icon, an `<zn-icon>` element.
 * @csspart label - The container that wraps the checkbox's label.
 * @csspart description - The container that wraps the checkbox's description.
 * @csspart selected-content - The container that wraps optional content that appears when a checkbox is checked.
 */
export default class ZnCheckbox extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {'zn-icon': ZnIcon};

  private readonly formControlController = new FormControlController(this, {
    value: (control: ZnCheckbox) => (control.checked ? control.value || 'on' : undefined),
    defaultValue: (control: ZnCheckbox) => control.defaultChecked,
    setValue: (control: ZnCheckbox, checked: boolean) => (control.checked = checked)
  });
  private readonly hasSlotController = new HasSlotController(this, 'description');

  @query('input[type="checkbox"]') input: HTMLInputElement;

  @state() private hasFocus = false;

  @property() title = ''; // make reactive to pass through

  /** The name of the checkbox, submitted as a name/value pair with form data. */
  @property() name = '';

  /** The current value of the checkbox, submitted as a name/value pair with form data. */
  @property() value: string;

  /** The checkbox's size. */
  @property({reflect: true}) size: 'small' | 'medium' | 'large' = 'medium';

  /** Disables the checkbox. */
  @property({type: Boolean, reflect: true}) disabled = false;

  /** Draws the checkbox in a checked state. */
  @property({type: Boolean, reflect: true}) checked = false;

  /**
   * Draws the checkbox in an indeterminate state. This is usually applied to checkboxes that represents a "select
   * all/none" behavior when associated checkboxes have a mix of checked and unchecked states.
   */
  @property({type: Boolean, reflect: true}) indeterminate = false;

  /** Draws a container around the checkbox. */
  @property({type: Boolean, reflect: true}) contained = false;

  /** Applies styles relevant to checkboxes in a horizontal layout. */
  @property({type: Boolean, reflect: true}) horizontal = false;

  /** The default value of the form control. Primarily used for resetting the form control. */
  @defaultValue('checked') defaultChecked = false;

  /**
   * By default, form controls are associated with the nearest containing `<form>` element. This attribute allows you
   * to place the form control outside of a form and associate it with the form that has this `id`. The form must be in
   * the same document or shadow root for this to work.
   */
  @property({reflect: true}) form = '';

  /** Makes the checkbox a required field. */
  @property({type: Boolean, reflect: true}) required = false;

  /** The checkbox's help text. If you need to display HTML, use the `description` slot instead. */
  @property({attribute: 'description'}) description = '';

  @property() label: string;

  @property({attribute: 'label-tooltip'}) labelTooltip: string;

  /** Gets the validity state object */
  get validity() {
    return this.input?.validity;
  }

  get isChecked() {
    return this.checked;
  }

  /** Gets the validation message */
  get validationMessage() {
    return this.input.validationMessage;
  }

  firstUpdated() {
    this.formControlController.updateValidity();
  }

  private handleClick() {
    if (this.disabled) {
      return;
    }

    this.checked = !this.checked;
    this.indeterminate = false;
    this.emit('zn-change');
  }

  private handleBlur() {
    this.hasFocus = false;
    this.emit('zn-blur');
  }

  private handleInput() {
    this.emit('zn-input');
  }

  private handleInvalid(event: Event) {
    this.formControlController.setValidity(false);
    this.formControlController.emitInvalidEvent(event);
  }

  private handleFocus() {
    this.hasFocus = true;
    this.emit('zn-focus');
  }

  private handleSelectedContentClick(event: MouseEvent) {
    // Prevent clicks on selected content from unchecking the checkbox
    event.preventDefault();
  }

  @watch('disabled', {waitUntilFirstUpdate: true})
  handleDisabledChange() {
    // Disabled form controls are always valid
    this.formControlController.setValidity(this.disabled);
  }

  @watch(['checked', 'indeterminate'], {waitUntilFirstUpdate: true})
  handleStateChange() {
    this.input.checked = this.checked; // force a sync update
    this.input.indeterminate = this.indeterminate; // force a sync update
    this.formControlController.updateValidity();
  }

  /** Simulates a click on the checkbox. */
  click() {
    this.input.click();
  }

  /** Sets focus on the checkbox. */
  focus(options?: FocusOptions) {
    this.input.focus(options);
  }

  /** Removes focus from the checkbox. */
  blur() {
    this.input.blur();
  }

  /** Checks for validity but does not show a validation message. Returns `true` when valid and `false` when invalid. */
  checkValidity() {
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

  /**
   * Sets a custom validation message. The value provided will be shown to the user when the form is submitted. To clear
   * the custom validation message, call this method with an empty string.
   */
  setCustomValidity(message: string) {
    this.input.setCustomValidity(message);
    this.formControlController.updateValidity();
  }

  render() {
    const hasDescriptionSlot = this.hasSlotController.test('description');
    const hasDescription = this.description ? true : hasDescriptionSlot;
    const hasLabelSlot = this.hasSlotController.test('label');
    const hasLabelTooltip = this.hasSlotController.test('label-tooltip');
    const hasLabel = this.label || hasLabelSlot;

    //
    // NOTE: we use a <div> around the label slot because of this Chrome bug.
    //
    // https://bugs.chromium.org/p/chromium/issues/detail?id=1413733
    //
    return html`
      <div
        class=${classMap({
          'form-control': true,
          'form-control--small': this.size === 'small',
          'form-control--medium': this.size === 'medium',
          'form-control--large': this.size === 'large',
          'form-control--checkbox-contained-wrapper': this.contained,
          'form-control--has-label': hasLabel,
        })}>

        <div
          part="form-control-label"
          id="label"
          class="form-control__label"
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
        </div>

        <label
          part="base"
          class=${classMap({
            checkbox: true,
            'checkbox--checked': this.checked,
            'checkbox--disabled': this.disabled,
            'checkbox--focused': this.hasFocus,
            'checkbox--indeterminate': this.indeterminate,
            'checkbox--contained': this.contained,
            'checkbox--horizontal': this.horizontal,
            'checkbox--small': this.size === 'small',
            'checkbox--medium': this.size === 'medium',
            'checkbox--large': this.size === 'large',
            'checkbox--has-description': hasDescription,
            'checkbox--has-selected-content': this.hasSlotController.test('selected-content')
          })}>

          <input
            class="checkbox__input"
            type="checkbox"
            title=${this.title /* An empty title prevents browser validation tooltips from appearing on hover */}
            name=${this.name}
            value=${ifDefined(this.value)}
            .indeterminate=${live(this.indeterminate)}
            .checked=${live(this.checked)}
            .disabled=${this.disabled}
            .required=${this.required}
            aria-checked=${this.checked ? 'true' : 'false'}
            aria-describedby=${hasDescription ? '' : 'description'}
            @click=${this.handleClick}
            @input=${this.handleInput}
            @invalid=${this.handleInvalid}
            @blur=${this.handleBlur}
            @focus=${this.handleFocus}
          />
          <span
            part="control${this.checked ? ' control--checked' : ''}${this.indeterminate
              ? ' control--indeterminate'
              : ''}"
            class="checkbox__control">
            ${this.checked
              ? html`
                <zn-icon part="checked-icon" class="checkbox__checked-icon" size="16" src="check"></zn-icon>`
              : ''}
            ${!this.checked && this.indeterminate
              ? html`
                <zn-icon
                  part="indeterminate-icon"
                  class="checkbox__indeterminate-icon"
                  size="16"
                  src="check_indeterminate_small"></zn-icon>`
              : ''}
          </span>

          <div part="label" class="checkbox__label">
            <slot></slot>
            <div
              aria-hidden=${hasDescription ? 'false' : 'true'}
              class="checkbox__description"
              id="description"
              part="description">
              <slot name="description">${this.description}</slot>
            </div>
            ${this.checked
              ? html`
                <zn-animation name="fadeIn" easing="ease" duration="300" iterations="1" play>
                  <slot
                    name="selected-content"
                    part="selected-content"
                    class="checkbox__selected-content"
                    @click=${this.handleSelectedContentClick}></slot>
                </zn-animation>`
              : ''}
          </div>
        </label>
      </div>
    `;
  }
}
