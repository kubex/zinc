import {type CSSResultGroup, html, type PropertyValues, type TemplateResult, unsafeCSS} from 'lit';
import {FormControlController} from '../../internal/form';
import {ifDefined} from 'lit/directives/if-defined.js';
import {property, query} from 'lit/decorators.js';
import {watch} from '../../internal/watch';
import ZincElement from '../../internal/zinc-element';
import type {ZincFormControl} from '../../internal/zinc-element';
import type ZnDropdown from '../dropdown';
import type ZnInput from '../input';

import styles from './defined-label.scss';

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
 * @dependency zn-panel
 * @dependency zn-select
 * @dependency zn-sp
 *
 * @csspart input - The component's main input.
 * @csspart input-value - The label's value inputs.
 */
export default class ZnDefinedLabel extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);

  private readonly formControlController = new FormControlController(this, {
    value: (control: this) => control.value + (control.inputValue ? `:${control.inputValue}` : ''),
  });

  @query('.input__control') input: ZnInput;
  @query('.defined-label__dropdown') dropdown: ZnDropdown;

  @property() value: string = '';
  @property() inputValue: string = '';
  @property({attribute: 'input-size', reflect: true}) inputSize: 'x-small' | 'small' | 'medium' | 'large' = 'medium';
  @property() name: string = 'label';
  @property() title: string;
  @property({type: Boolean}) disabled: boolean = false;
  @property({attribute: 'allow-custom', type: Boolean}) allowCustom: boolean = false;
  @property({type: Array, attribute: 'predefined-labels'}) predefinedLabels = [];

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

    if (target.hasAttribute('data-label')) this.value = target.getAttribute('data-label') ?? "";
  }

  private handleInputValueInput(e: Event) {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    this.inputValue = target.value.toLowerCase();

    if (target.hasAttribute('data-label')) this.value = target.getAttribute('data-label') ?? "";
  }

  private handleFormSubmit() {
    const form = this.formControlController.getForm();

    if (form && form.reportValidity()) {
      document.dispatchEvent(new CustomEvent('zn-register-element', {
        detail: {element: form}
      }))
      form.requestSubmit();
    }
  }

  render() {
    let predefinedLabels = html``;

    if (this.predefinedLabels.length > 0) {
      this.predefinedLabels.forEach((label: { [key: string]: any } | string | null) => {
        // label = ['name' => 'label', 'options'=>['one', 'two', 'three']]
        let options: string[] | undefined;
        if (label && typeof label !== 'string') {
          options = label.options as string[];
          label = label.name as string;
        }

        if (this.value && !label?.toLowerCase().includes(this.value.toLowerCase())) {
          return;
        }

        let selector: TemplateResult<1>;
        if (options && options.length > 0) {
          selector = html`
            <zn-select
              part="input-value"
              id="input-value input-value-${label}"
              class="input__control-value input__control-value--${label}"
              data-label="${label}"
              @zn-change="${this.handleInputValueChange}"
              @zn-input="${this.handleInputValueInput}"
              size="small">
              <zn-option value="">Select ${label}</zn-option>
              ${options.map((option: string) => html`
                <zn-option value="${option}">${option}</zn-option>
              `)}
            </zn-select>`;
        } else {
          selector = html`
            <zn-input
              part="input-value"
              id="input-value input-value-${label}"
              class="input__control-value input__control-value--${label}"
              type="text"
              data-label="${label}"
              @zn-change="${this.handleInputValueChange}"
              @zn-input="${this.handleInputValueInput}"
              size="small"></zn-input>`;
        }

        predefinedLabels = html`
          <div class="defined-label__input">
            <small>${label}</small>
            <div class="defined-label__input-wrap">
              ${selector}
              <zn-button type="submit" icon="add" @click="${this.handleFormSubmit}"></zn-button>
            </div>
          </div>`;
      });
    }

    return html`
      <zn-dropdown class="defined-label__dropdown">
        <zn-input
          part="input"
          id="input"
          class="input__control"
          type="text"
          title="${this.title}"
          value="${this.value}"
          name="${ifDefined(this.name)}"
          placeholder="Add a Label"
          maxlength="60"
          autocomplete="off"
          size="${this.inputSize}"
          @zn-change="${this.handleChange}"
          @zn-input="${this.handleInput}"
          @click="${this.handleClick}"
          slot="trigger"
        ></zn-input>

        <zn-panel class="defined-label__container">
          <zn-sp flush divide>
            ${predefinedLabels.values.length > 0 ? predefinedLabels : html`
              <div class="defined-label__input">
                <small>Cannot find any predefined labels</small>
              </div>`}

            ${this.allowCustom && this.value !== '' ? html`
              <div class="defined-label__input">
                <small>${this.value}</small>
                <div class="defined-label__input-wrap">
                  <zn-input part="input-value"
                            placeholder="Label Value"
                            type="text"
                            size="small"
                            maxlength="60"
                            @zn-change="${this.handleInputValueChange}"
                            @zn-input="${this.handleInputValueInput}"></zn-input>
                  <zn-button type="submit" icon="add" @click="${this.handleFormSubmit}"></zn-button>
                </div>
              </div>` : ''}

          </zn-sp>
        </zn-panel>
      </zn-dropdown>
    `;
  }
}
