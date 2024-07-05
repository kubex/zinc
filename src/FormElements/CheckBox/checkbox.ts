import {html, unsafeCSS} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';

import styles from './index.scss?inline';
import {ZincElement, ZincFormControl} from "@/zinc-element";
import {FormControlController} from "@/form";
import {PropertyValues} from "@lit/reactive-element";
import {watch} from "@/watch";
import {defaultValue} from "@/default-value";

@customElement('zn-checkbox')
export class Checkbox extends ZincElement implements ZincFormControl
{
  static styles = unsafeCSS(styles);

  @property({}) title;
  @property({}) description;

  @property() name: string = "";
  @property() value: string;

  @property({type: Boolean, reflect: true}) checked = false;
  @defaultValue('checked') defaultChecked = false;

  @query('input[type="checkbox"]') input: HTMLInputElement;

  private readonly formControlController = new FormControlController(this, {
    value: (control: Checkbox) => (control.checked ? control.value || 'on' : undefined),
    defaultValue: (control: Checkbox) => control.defaultChecked,
    setValue: (control: Checkbox, checked: boolean) => (control.checked = checked)
  });

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

  private handleClick()
  {
    this.checked = !this.checked;
    this.emit('zn-change');
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

  @watch(['checked'], {waitUntilFirstUpdate: true})
  handleStateChange()
  {
    this.input.checked = this.checked; // force a sync update
    this.formControlController.updateValidity();
  }

  render()
  {
    return html`
      <div class="checkbox__wrapper">
        <label>
          <div class="checkbox__input-wrapper">
            <input type="checkbox"
                   class="checkbox__input"
                   name="${this.name}"
                   .checked=${this.checked}
                   @click=${this.handleClick}/>
            <span class="checkbox__control">
              ${this.checked ? html`
                <zn-icon src="check" class="checkbox__check-icon" size="12"></zn-icon>` : ''}
            </span>
          </div>
          <div class="checkbox__label-wrapper">
            ${this.title}
            <p>${this.description}</p>
          </div>
        </label>
      </div>`;
  }
}
