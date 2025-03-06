import {property, query, state} from 'lit/decorators.js';
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {watch} from '../../internal/watch';
import ZincElement, {ZincFormControl} from '../../internal/zinc-element';

import styles from './checkbox-group.scss';
import {classMap} from "lit/directives/class-map.js";
import {
  customErrorValidityState,
  FormControlController,
  validValidityState,
  valueMissingValidityState
} from "../../internal/form";
import {HasSlotController} from '../../internal/slot';
import ZnCheckbox from "../checkbox";

/**
 * @summary Shotrt summary of the component's intended use.
 * @documentation https://zinc.style/components/checkbox-group
 * @status experimental
 * @since 1.0
 *
 * @slot - The default slot where `<zn-checkbox>` elements are placed.
 * @slot label - The checkbox group's label. Required for proper accessibility. Alternatively, you can use the `label` attribute.
 * @slot label-tooltip - Used to add text that is displayed in a tooltip next to the label. Alternatively, you can use the `label-tooltip` attribute.
 * @slot help-text - Text that describes how to use the checkbox group. Alternatively, you can use the `help-text` attribute.
 *
 * @event zn-change - Emitted when the checkbox group's selected value changes.
 * @event zn-input - Emitted when the checkbox group receives user input.
 * @event zn-invalid - Emitted when the form control has been checked for validity and its constraints aren't satisfied.
 *
 * @csspart form-control - The form control that wraps the label, input, and help text.
 * @csspart form-control-label - The label's wrapper.
 * @csspart form-control-input - The input's wrapper.
 * @csspart form-control-help-text - The help text's wrapper.
 */
export default class ZnCheckboxGroup extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);

  protected readonly formControlController = new FormControlController(this);
  private readonly hasSlotController = new HasSlotController(this, 'help-text', 'label');
  private customValidityMessage = '';
  private validationTimeout: number;

  @query('slot:not([name])') defaultSlot: HTMLSlotElement;
  @query('.checkbox-group__validation-input') validationInput: HTMLInputElement;

  @state() private errorMessage = '';

  /**
   * The checkbox group's label. Required for proper accessibility. If you need to display HTML, use the `label` slot instead. */
  @property() label = '';

  /** Text that appears in a tooltip next to the label. If you need to display HTML in the tooltip, use the `label-tooltip` slot instead. */
  @property({attribute: 'label-tooltip'}) labelTooltip = '';

  /** The checkbox groups's help text. If you need to display HTML, use the `help-text` slot instead. */
  @property({attribute: 'help-text'}) helpText = '';

  /** The name of the checkbox group, submitted as a name/value pair with form data. */
  @property() name = '';

  /**
   * The current value of the checkbox group, submitted as a name/value pair with form data.
   */
  @property({type: Array, reflect: true}) value: string[] = [];

  /** The checkbox group's size. This size will be applied to all child checkboxes. */
  @property({reflect: true}) size: 'small' | 'medium' | 'large' = 'medium';

  /** The checkbox group's orientation. Changes the group's layout from the default (vertical) to horizontal. */
  @property({type: Boolean, reflect: true}) horizontal = false;

  /** The checkbox group's style. Changes the group's style from the default (plain) style to the 'contained' style. This style will be applied to all child checkboxes. */
  @property({type: Boolean, reflect: true}) contained = false;

  /**
   * By default, form controls are associated with the nearest containing `<form>` element. This attribute allows you
   * to place the form control outside of a form and associate it with the form that has this `id`. The form must be in
   * the same document or shadow root for this to work.
   */
  @property({reflect: true}) form = '';

  /** Ensures at least one child checkbox is checked before allowing the containing form to submit. */
  @property({type: Boolean, reflect: true}) required = false;

  /** Gets the validity state object */
  get validity() {
    const anyCheckboxChecked = this.value.length > 0;
    const isRequiredAndEmpty = this.required && !anyCheckboxChecked;
    const hasCustomValidityMessage = this.customValidityMessage !== '';

    if (hasCustomValidityMessage) {
      return customErrorValidityState;
    } else if (isRequiredAndEmpty) {
      return valueMissingValidityState;
    }

    return validValidityState;
  }

  /** Gets the validation message */
  get validationMessage() {
    const anyCheckboxChecked = this.value.length > 0;
    const isRequiredAndEmpty = this.required && !anyCheckboxChecked;
    const hasCustomValidityMessage = this.customValidityMessage !== '';

    if (hasCustomValidityMessage) {
      return this.customValidityMessage;
    } else if (isRequiredAndEmpty) {
      return this.validationInput.validationMessage;
    }

    return '';
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListenerToCheckboxes();
    this.getValueFromCheckboxes();
  }

  firstUpdated() {
    this.updateCheckboxValidity();
    this.formControlController.updateValidity();
  }

  private getAllCheckboxes() {
    return [...this.querySelectorAll<ZnCheckbox>('zn-checkbox')];
  }

  private handleCheckboxClick(event: MouseEvent) {
    const target = event.currentTarget as ZnCheckbox;

    if (target.disabled) {
      return;
    }
    this.getValueFromCheckboxes();
    this.updateCheckboxValidity();

    this.emit('zn-change');
    this.emit('zn-input');
    event.stopPropagation();
  }

  private handleInvalid(event: Event) {
    this.formControlController.setValidity(false);
    this.formControlController.emitInvalidEvent(event);
  }

  private async syncCheckboxElements() {
    const checkboxes = this.getAllCheckboxes();
    await Promise.all(
      /** Sync the checkbox size, validity, and existence of 'contained' style */
      checkboxes.map(async checkbox => {
        await checkbox.updateComplete;
        checkbox.size = this.size;
        checkbox.horizontal = this.horizontal;

        // Add class to checkboxes in a Checkbox Group so that we can style them without using :slotted
        checkbox.classList.add('groupedCheckbox');

        // If one checkbox in a group is 'contained' make sure they're all contained
        const isAnyContained = checkboxes.some(containedCheckbox => containedCheckbox.contained);
        if (isAnyContained) {
          checkboxes.forEach(containedCheckbox => {
            containedCheckbox.contained = true;
          });

          // Otherwise 'contained' is set through Checkbox Group
        } else {
          checkbox.contained = this.contained;
        }

        // Also get initial value of all nested checkboxes
        this.getValueFromCheckboxes();
      })
    );
  }

  private syncCheckboxes() {
    if (customElements.get('zn-checkbox')) {
      this.syncCheckboxElements();
    } else {
      customElements.whenDefined('zn-checkbox').then(() => this.syncCheckboxes());
    }
  }

  private updateCheckboxValidity() {
    if (this.required) {
      const anyCheckboxChecked = this.value.length > 0;
      const checkboxes = this.getAllCheckboxes();
      this.updateComplete.then(() => {
        const checkboxGroupUserInvalid = this.dataset?.userInvalid !== undefined;
        checkboxes.forEach(checkbox => {
          checkbox.required = !anyCheckboxChecked;

          // Add 'checkbox-user-invalid' class to all checkboxes in the group so they can be styled like 'data-user-invalid'
          if (checkboxGroupUserInvalid) {
            checkbox.classList.add('checkbox-user-invalid');
          } else {
            checkbox.classList.remove('checkbox-user-invalid');
          }
        });
      });
    }
  }

  private getValueFromCheckboxes() {
    const checkboxes = this.getAllCheckboxes();
    this.value = checkboxes.filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);
  }

  private addEventListenerToCheckboxes() {
    const checkboxes = this.getAllCheckboxes();
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('zn-change', this.handleCheckboxClick.bind(this));
    });
  }

  @watch('size', {waitUntilFirstUpdate: true})
  handleSizeChange() {
    this.syncCheckboxes();
  }

  @watch('value')
  handleValueChange() {
    if (this.hasUpdated) {
      this.getValueFromCheckboxes();
      this.updateCheckboxValidity();
    }
  }

  /** Checks for validity but does not show a validation message. Returns `true` when valid and `false` when invalid. */
  checkValidity() {
    const anyCheckboxChecked = this.value.length > 0;
    const isRequiredAndEmpty = this.required && !anyCheckboxChecked;
    const hasCustomValidityMessage = this.customValidityMessage !== '';

    if (isRequiredAndEmpty || hasCustomValidityMessage) {
      this.formControlController.emitInvalidEvent();
      return false;
    }

    return true;
  }

  /** Gets the associated form, if one exists. */
  getForm(): HTMLFormElement | null {
    return this.formControlController.getForm();
  }

  /** Checks for validity and shows the browser's validation message if the control is invalid. */
  reportValidity(): boolean {
    const isValid = this.validity.valid;

    this.errorMessage = this.customValidityMessage || isValid ? '' : this.validationInput.validationMessage;
    this.formControlController.setValidity(isValid);
    this.validationInput.hidden = true;
    clearTimeout(this.validationTimeout);

    if (!isValid) {
      // Show the browser's constraint validation message
      this.validationInput.hidden = false;
      this.validationInput.reportValidity();
      this.validationTimeout = setTimeout(() => (this.validationInput.hidden = true), 10000) as unknown as number;
    }

    return isValid;
  }

  /** Sets a custom validation message. Pass an empty string to restore validity. */
  setCustomValidity(message = '') {
    this.customValidityMessage = message;
    this.errorMessage = message;
    this.validationInput.setCustomValidity(message);
    this.formControlController.updateValidity();
  }

  render() {
    const hasLabelSlot = this.hasSlotController.test('label');
    const hasLabelTooltipSlot = this.hasSlotController.test('label-tooltip');
    const hasHelpTextSlot = this.hasSlotController.test('help-text');
    const hasLabel = this.label ? true : hasLabelSlot;
    const hasLabelTooltip = this.labelTooltip ? true : hasLabelTooltipSlot;
    const hasHelpText = this.helpText ? true : hasHelpTextSlot;
    const defaultSlot = html`
      <slot @slotchange=${this.syncCheckboxes}></slot> `;

    return html`
      <fieldset
        part="form-control"
        class=${classMap({
          'form-control': true,
          'form-control--small': this.size === 'small',
          'form-control--medium': this.size === 'medium',
          'form-control--large': this.size === 'large',
          'form-control--checkbox-group': true,
          'form-control--has-label': hasLabel,
          'form-control--has-label-tooltip': hasLabelTooltip,
          'form-control--has-help-text': hasHelpText
        })}
        role="listbox"
        aria-labelledby="label"
        aria-describedby="help-text"
        aria-errormessage="error-message">
        <label
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
        </label>

        <div part="form-control-input" class="form-control-input">
          <div class="visually-hidden">
            <div id="error-message" aria-live="assertive">${this.errorMessage}</div>
            <label class="checkbox-group__validation">
              <input
                type="text"
                class="checkbox-group__validation-input"
                ?required=${this.required}
                tabindex="-1"
                hidden
                @invalid=${this.handleInvalid}/>
            </label>
          </div>
          ${defaultSlot}
        </div>

        <div
          part="form-control-help-text"
          id="help-text"
          class="form-control__help-text"
          aria-hidden=${hasHelpText ? 'false' : 'true'}>
          <slot name="help-text">${this.helpText}</slot>
        </div>
      </fieldset>
    `;
  }
}
