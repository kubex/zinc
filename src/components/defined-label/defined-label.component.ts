import {type CSSResultGroup, html, nothing, type PropertyValues, type TemplateResult, unsafeCSS} from 'lit';
import {FormControlController} from '../../internal/form';
import {ifDefined} from 'lit/directives/if-defined.js';
import {property, query} from 'lit/decorators.js';
import {watch} from '../../internal/watch';
import ZincElement from '../../internal/zinc-element';
import ZnButton from '../button';
import ZnDropdown from '../dropdown';
import ZnInput from '../input';
import ZnOption from '../option';
import ZnSelect from '../select';
import type {ZincFormControl} from '../../internal/zinc-element';

import styles from './defined-label.scss';

interface PredefinedLabel {
  name: string;
  options?: string[];
}

/**
 * @summary This component provides a labeled input with support for predefined and custom labels,
 * allowing users to select or enter label-value pairs within a dropdown interface.
 * @documentation https://zinc.style/components/defined-label
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-button
 * @dependency zn-dropdown
 * @dependency zn-input
 * @dependency zn-option
 * @dependency zn-select
 *
 * @csspart input - The component's main input.
 * @csspart input-value - The label's value inputs.
 */
export default class ZnDefinedLabel extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-button': ZnButton,
    'zn-dropdown': ZnDropdown,
    'zn-input': ZnInput,
    'zn-option': ZnOption,
    'zn-select': ZnSelect
  };

  private readonly formControlController = new FormControlController(this, {
    value: (control: this) => control.value + (control.inputValue ? `:${control.inputValue}` : ''),
  });

  @query('.defined-label__input') input: ZnInput;
  @query('.defined-label__dropdown') dropdown: ZnDropdown;

  /** The selected label key. Also acts as the filter while typing. */
  @property() value: string = '';

  /** The value entered for the selected label. Submitted as `label:value` when present. */
  @property() inputValue: string = '';

  /** The size of the main input. */
  @property({attribute: 'input-size', reflect: true}) inputSize: 'x-small' | 'small' | 'medium' | 'large' = 'medium';

  /** The name of the control. Used for form submission. */
  @property() name: string = 'label';

  /** The title of the main input. */
  @property() title: string;

  /** Disables the control. */
  @property({type: Boolean}) disabled: boolean = false;

  /** Allows labels that aren't in the predefined list. */
  @property({attribute: 'allow-custom', type: Boolean}) allowCustom: boolean = false;

  /** The predefined labels. Entries are either a string or `{name, options}`. */
  @property({type: Array, attribute: 'predefined-labels'}) predefinedLabels: (PredefinedLabel | string)[] = [];

  get validationMessage() {
    return this.input.validationMessage;
  }

  get validity() {
    return this.input?.validity;
  }

  checkValidity(): boolean {
    return this.input.checkValidity();
  }

  getForm(): HTMLFormElement | null {
    return this.formControlController.getForm();
  }

  reportValidity(): boolean {
    return this.input.reportValidity();
  }

  setCustomValidity(message: string): void {
    this.input.setCustomValidity(message);
    this.formControlController.updateValidity();
  }

  @watch('value', {waitUntilFirstUpdate: true})
  async handleValueChange() {
    await this.updateComplete;
    this.formControlController.updateValidity();
  }

  protected firstUpdated(changedProperties: PropertyValues) {
    super.firstUpdated(changedProperties)
    this.formControlController.updateValidity();
  }

  private getFilteredLabels(): PredefinedLabel[] {
    const filter = this.value.toLowerCase();
    return this.predefinedLabels
      .map(label => typeof label === 'string' ? {name: label} : label)
      .filter((label): label is PredefinedLabel => Boolean(label?.name))
      .filter(label => !filter || label.name.toLowerCase().includes(filter));
  }

  private handleChange() {
    if (!this.dropdown.open) {
      this.dropdown.show().then(r => r);
    }

    if (this.dropdown.open && this.input.value === '') {
      this.dropdown.hide().then(r => r);
    }

    if (typeof this.input.value === 'string') {
      this.input.value = this.input.value.toLowerCase();
    }

    this.value = this.input.value as string;
  }

  private handleInput() {
    this.handleChange();
    this.formControlController.updateValidity();
  }

  private handleClick(e: MouseEvent) {
    if (this.input.value === '' || (this.dropdown.open && this.input.value !== '')) {
      e.stopImmediatePropagation();
    }
  }

  private handleInputValueChange(e: Event) {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    this.inputValue = target.value.toLowerCase();
  }

  private handleFormSubmit(e: Event, label: string) {
    // Submit the key shown on the clicked row — a predefined name, or the typed
    // key for the custom row — and discard values left behind on other rows
    const row = (e.currentTarget as HTMLElement).closest('.defined-label__row');
    const control = row?.querySelector<ZnInput | ZnSelect>('.defined-label__value');
    this.value = label;
    this.inputValue = control ? String(control.value ?? '').toLowerCase() : '';

    const form = this.formControlController.getForm();

    if (form && form.reportValidity()) {
      document.dispatchEvent(new CustomEvent('zn-register-element', {
        detail: {element: form}
      }))
      form.requestSubmit();
    }
  }

  private renderValueControl(label: PredefinedLabel): TemplateResult {
    if (label.options && label.options.length > 0) {
      return html`
        <zn-select
          part="input-value"
          class="defined-label__value"
          size="small"
          @zn-change="${this.handleInputValueChange}"
          @zn-input="${this.handleInputValueChange}">
          <zn-option value="">Select ${label.name}</zn-option>
          ${label.options.map(option => html`
            <zn-option value="${option}">${option}</zn-option>`)}
        </zn-select>`;
    }

    return html`
      <zn-input
        part="input-value"
        class="defined-label__value"
        type="text"
        placeholder="Label Value"
        size="small"
        @zn-change="${this.handleInputValueChange}"
        @zn-input="${this.handleInputValueChange}"></zn-input>`;
  }

  private renderRow(label: string, control: TemplateResult): TemplateResult {
    return html`
      <div class="defined-label__row">
        <small class="defined-label__row-label">${label}</small>
        <div class="defined-label__row-controls">
          ${control}
          <zn-button
            type="submit"
            icon="add"
            @click="${(e: Event) => this.handleFormSubmit(e, label)}"></zn-button>
        </div>
      </div>`;
  }

  render() {
    const labels = this.getFilteredLabels();
    const showCustom = this.allowCustom && this.value !== '' && !labels.some(label => label.name === this.value);

    return html`
      <zn-dropdown class="defined-label__dropdown" sync="width">
        <zn-input
          part="input"
          id="input"
          class="defined-label__input"
          type="text"
          title="${ifDefined(this.title)}"
          value="${this.value}"
          name="${ifDefined(this.name)}"
          placeholder="Add a Label"
          maxlength="60"
          autocomplete="off"
          size="${this.inputSize}"
          ?disabled="${this.disabled}"
          @zn-change="${this.handleChange}"
          @zn-input="${this.handleInput}"
          @click="${this.handleClick}"
          slot="trigger"
        ></zn-input>

        <div class="defined-label__panel">
          ${labels.length > 0
            ? labels.map(label => this.renderRow(label.name, this.renderValueControl(label)))
            : html`
              <div class="defined-label__empty">Cannot find any predefined labels</div>`}

          ${showCustom ? this.renderRow(this.value, html`
            <zn-input
              part="input-value"
              class="defined-label__value"
              placeholder="Label Value"
              type="text"
              size="small"
              maxlength="60"
              @zn-change="${this.handleInputValueChange}"
              @zn-input="${this.handleInputValueChange}"></zn-input>`) : nothing}
        </div>
      </zn-dropdown>
    `;
  }
}
