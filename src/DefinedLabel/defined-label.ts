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
  @property() name: string;
  @property() title: string;
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
    this.value = this.input.value;
  }

  private handleInput()
  {
    this.value = this.input.value;
    this.formControlController.updateValidity();
  }

  private handleInputValueChange()
  {
    this.inputValue = this.valueInput.value;
  }

  private handleInputValueInput()
  {
    this.inputValue = this.valueInput.value;
  }

  private handleFormSubmit()
  {
    this.formControlController.submit();
  }

  render()
  {
    let predefinedLabels = html``;

    if(this.predefinedLabels.length > 0)
    {
      this.predefinedLabels.forEach((label) =>
      {
        // filter based on input value
        console.log('value', this.value);
        if(this.value && !label.toLowerCase().includes(this.value.toLowerCase()))
        {
          console.log('skipping', label);
          return;
        }
        predefinedLabels = html`
          ${predefinedLabels}
          <div class="defined-label__container">
            <div class="defined-label__left">
              ${label}
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
          <div class="defined-label__container">
            <div class="defined-label__left">
              <p><small>Add Custom Label</small></p>
              ${this.value}${this.inputValue ? `:${this.inputValue}` : ''}
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
          ${predefinedLabels}
        ` : ''}
      </div>
    `;
  }
}


