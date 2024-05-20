import { html, unsafeCSS } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

import styles from './index.scss?inline';
import { ZincElement, ZincFormControl } from "@/zinc-element";
import { FormControlController } from "@/form";
import { PropertyValues } from "@lit/reactive-element";

@customElement('zn-checkbox')
export class Checkbox extends ZincElement implements ZincFormControl
{
  static styles = unsafeCSS(styles);

  @property({}) title;
  @property({}) description;

  @property() name: string = "";
  @property() value: string;

  @query('input')
  private input: HTMLInputElement;

  private readonly formControlController = new FormControlController(this, {});


  get validity()
  {
    return this.input.validity;
  }

  get validationMessage()
  {
    return this.input.validationMessage;
  }

  protected firstUpdated(_changedProperties: PropertyValues)
  {
    return this.formControlController.updateValidity();
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

  toggle()
  {
    this.input.click();
    this.input.focus();
    this.formControlController.updateValidity();
  }

  render()
  {
    return html`
      <div class="checkbox__wrapper" @click="${this.toggle}">
        <div class="checkbox__input-wrapper">
          <input type="checkbox" name="${this.name}">
        </div>
        <div class="checkbox__label-wrapper">
          <label for="${this.name}">${this.title}
            <p>${this.description}</p>
          </label>
        </div>
      </div>`;
  }
}
