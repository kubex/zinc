import { property, query } from 'lit/decorators.js';
import { type CSSResultGroup, html, PropertyValues, TemplateResult, unsafeCSS } from 'lit';
import { watch } from '../../internal/watch';
import ZincElement from '../../internal/zinc-element';
import { live } from "lit/directives/live.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { FormControlController } from "../../internal/form";

import styles from './defined-label.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/defined-label
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
export default class ZnDefinedLabel extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  private readonly formControlController = new FormControlController(this, {
    value: (control: this) => control.value + (control.inputValue ? `:${control.inputValue}` : ''),
  });

  @query('.input__control') input: HTMLInputElement;
  @query('.input__control-value') valueInput: HTMLInputElement;

  @property() value: string = '';
  @property() inputValue: string = '';
  @property() name: string = 'label';
  @property() title: string;
  @property({ type: Boolean }) disabled: boolean = false;
  @property({ type: Array, attribute: 'predefined-labels' }) predefinedLabels = [];

  get validationMessage() {
    return this.input.validationMessage;
  }

  get validity() {
    return this.input.validity;
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

  @watch('value', { waitUntilFirstUpdate: true })
  async handleValueChange() {
    await this.updateComplete;
    this.formControlController.updateValidity();
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    this.formControlController.updateValidity();
  }

  private handleChange() {
    this.input.value = this.input.value.toLowerCase();
    this.value = this.input.value;
  }

  private handleInput() {
    this.input.value = this.input.value.toLowerCase();
    this.value = this.input.value;
    this.formControlController.updateValidity();
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
    this.formControlController.submit();
  }

  render() {
    let predefinedLabels = html``;
    let identifiedLabels = 0;

    if (this.predefinedLabels.length > 0) {
      this.predefinedLabels.forEach((label: { [key: string]: any } | string | null) => {
        // label = ['name' => 'label', 'options'=>['one', 'two', 'three']]
        let options: any[] = [];
        if (label && typeof label !== 'string') {
          options = label.options;
          label = label.name;
        }


        if (this.value && !label?.toLowerCase().includes(this.value.toLowerCase())) {
          return;
        }

        let selector: TemplateResult<1>;
        if (options && options.length > 0) {
          selector = html`
            <select
              part="input-value"
              id="input-value input-value-${label}"
              class="input__control-value input__control-value--${label}"
              data-label="${label}"
              @change="${this.handleInputValueChange}"
              @input="${this.handleInputValueInput}"
            >
              <option value="">Select ${label}</option>
              ${options.map((option: any) => html`
                <option value="${option}">${option}</option>
              `)}
            </select>`;
        } else {
          selector = html`
            <input
              part="input-value"
              id="input-value input-value-${label}"
              class="input__control-value input__control-value--${label}"
              type="text"
              data-label="${label}"
              @change="${this.handleInputValueChange}"
              @input="${this.handleInputValueInput}"
            />`;
        }


        identifiedLabels++;
        predefinedLabels = html`
          <div class="defined-label__container">
            <div class="defined-label__left">
              ${label}
            </div>
            <div class="defined-label__right">
              ${selector}
            </div>
            <div class="defined-label__submit">
              <zn-button type="submit" icon="add" slot="submit" size="small"
                         @click="${this.handleFormSubmit}"></zn-button>
            </div>
          </div>`;
      });
    }

    return html`
      <div class="defined-label">
        <input
          part="input"
          id="input"
          class="input__control"
          type="text"
          title="${this.title}"
          name="${ifDefined(this.name)}"
          placeholder="Label"
          .value="${live(this.value)}"
          @change="${this.handleChange}"
          @input="${this.handleInput}"
        />
        ${this.value !== '' ? html`
          <div class="defined-label__wrap">
            <p class="defined-label__label"><small>Add Custom Label</small></p>
            <div class="defined-label__container">
              <div class="defined-label__left">
                ${this.value}
              </div>
              <div class="defined-label__right">
                <input
                  part="input-value"
                  id="input-value"
                  class="input__control-value"
                  type="text"
                  @change="${this.handleInputValueChange}"
                  @input="${this.handleInputValueInput}"
                />
              </div>
              <div class="defined-label__submit">
                <zn-button type="submit" icon="add" slot="submit" size="small"
                           @click="${this.handleFormSubmit}"></zn-button>
              </div>
            </div>
          </div>
          ${identifiedLabels > 0 ? html`
            <p class="defined-label__label"><small>Add Predefined Label</small></p>` : ''}
          ${predefinedLabels}
        ` : ''}
      </div>
    `;
  }
}
