import {ZincElement, ZincFormControl} from "@/zinc-element";
import {html, unsafeCSS} from "lit";
import {customElement, property, query} from 'lit/decorators.js';

import styles from './index.scss?inline';
import {FormControlController} from "@/form";
import {ifDefined} from "lit/directives/if-defined.js";
import {live} from "lit/directives/live.js";
import {watch} from "@/watch";
import {PropertyValues} from "@lit/reactive-element";

@customElement('zn-defined-label')
export class DefinedLabel extends ZincElement implements ZincFormControl
{
  static styles = unsafeCSS(styles);

  private readonly formControlController = new FormControlController(this, {
    value: (control: this) => control.value + (control.inputValue ? `:${control.inputValue}` : ''),
  });

  @query('.input__control') input: HTMLInputElement;
  @query('.input__control-value') valueInput: HTMLInputElement;

  @property() value: string = '';
  @property() inputValue: string = '';
  @property() name: string = 'label';
  @property() title: string;
  @property({type: Boolean}) disabled: boolean = false;
  @property({type: Array, attribute: 'predefined-labels'}) predefinedLabels = [];

  get validationMessage()
  {
    return this.input.validationMessage;
  }

  get validity()
  {
    return this.input.validity;
  }

  checkValidity(): boolean
  {
    return this.input.checkValidity();
  }

  getForm(): HTMLFormElement | null
  {
    return this.formControlController.getForm();
  }

  reportValidity(): boolean
  {
    return this.input.reportValidity();
  }

  setCustomValidity(message: string): void
  {
    this.input.setCustomValidity(message);
    this.formControlController.updateValidity();
  }

  @watch('value', {waitUntilFirstUpdate: true})
  async handleValueChange()
  {
    await this.updateComplete;
    this.formControlController.updateValidity();
  }

  protected firstUpdated(_changedProperties: PropertyValues)
  {
    this.formControlController.updateValidity();
  }

  private handleChange()
  {
    this.input.value = this.input.value.toLowerCase();
    this.value = this.input.value;
  }

  private handleInput()
  {
    this.input.value = this.input.value.toLowerCase();
    this.value = this.input.value;
    this.formControlController.updateValidity();
  }

  private handleInputValueChange(e: Event)
  {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    this.inputValue = target.value.toLowerCase();

    if(target.hasAttribute('data-label')) this.value = target.getAttribute('data-label');
  }

  private handleInputValueInput(e: Event)
  {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    this.inputValue = target.value.toLowerCase();

    if(target.hasAttribute('data-label')) this.value = target.getAttribute('data-label');
  }

  private handleFormSubmit()
  {
    this.formControlController.submit();
  }

  render()
  {
    let predefinedLabels = html``;
    let identifiedLabels = 0;

    if(this.predefinedLabels.length > 0)
    {
      this.predefinedLabels.forEach((label) =>
      {
        // label = ['name' => 'label', 'options'=>['one', 'two', 'three']]
        let options = [];
        if(typeof label !== 'string')
        {
          options = label.options;
          label = label.name;
        }


        if(this.value && !label.toLowerCase().includes(this.value.toLowerCase()))
        {
          return;
        }

        let selector = html``;
        if(options && options.length > 0)
        {
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
              ${options.map((option) => html`
                <option value="${option}">${option}</option>
              `)}
            </select>`;
        }
        else
        {
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


