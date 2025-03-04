import {property, query} from 'lit/decorators.js';
import {type CSSResultGroup, html, PropertyValues, unsafeCSS} from 'lit';
import {watch} from '../../internal/watch';
import ZincElement, {ZincFormControl} from '../../internal/zinc-element';

import styles from './checkbox.scss';
import {defaultValue} from "../../internal/default-value";
import {FormControlController} from "../../internal/form";

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/checkbox
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
export default class ZnCheckbox extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({}) title: string;
  @property({}) description: string;

  @property() name: string = "";
  @property() value: string;

  @property({type: Boolean, reflect: true}) checked = false;
  @defaultValue('checked') defaultChecked = false;

  @query('input[type="checkbox"]') input: HTMLInputElement;

  private readonly formControlController = new FormControlController(this, {
    value: (control: ZnCheckbox) => (control.checked ? control.value || 'on' : undefined),
    defaultValue: (control: ZnCheckbox) => control.defaultChecked,
    setValue: (control: ZnCheckbox, checked: boolean) => (control.checked = checked)
  });

  get validity() {
    return this.input.validity;
  }

  get validationMessage() {
    return this.input.validationMessage;
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    return this.formControlController.updateValidity();
  }

  private handleClick() {
    this.checked = !this.checked;
    this.emit('zn-change');
  }

  public click() {
    this.input.click();
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

  @watch(['checked'], {waitUntilFirstUpdate: true})
  handleStateChange() {
    this.input.checked = this.checked; // force a sync update
    this.formControlController.updateValidity();
  }

  render() {
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
