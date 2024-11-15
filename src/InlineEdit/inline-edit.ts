import {html, unsafeCSS} from "lit";
import {customElement, property, query, state} from 'lit/decorators.js';
import {ZincElement, ZincFormControl} from "@/zinc-element";
import {FormControlController} from "@/form";
import {PropertyValues} from "@lit/reactive-element";
import {classMap} from "lit/directives/class-map.js";

import styles from './index.scss?inline';
import {HasSlotController} from "@/slot";

@customElement('zn-inline-edit')
export class InlineEdit extends ZincElement implements ZincFormControl
{
  static styles = unsafeCSS(styles);

  private readonly formControlController = new FormControlController(this, {
    defaultValue: (control: InlineEdit) => control.defaultValue,
  });

  private readonly slotController = new HasSlotController(this);

  @state() private hasFocus = false;
  @state() private isEditing = false;

  @query('.ai__input') input: HTMLInputElement | HTMLSelectElement;

  @property({attribute: 'caption-size', reflect: true}) captionSize: 'xsmall' | 'small' | 'medium' | 'large' = 'medium';
  @property() value: string;
  @property() name: string;
  @property({attribute: 'default-value'}) defaultValue: string;
  @property() caption: string = ""; // Caption
  @property({type: Boolean}) disabled: boolean = false;
  @property({type: Boolean}) horizontal: boolean = false;

  @property({attribute: 'options', type: Object}) options: { [key: string]: string } = {};


  get validity(): ValidityState
  {
    return this.input.validity;
  }

  get validationMessage(): string
  {
    return this.input.validationMessage;
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
  }

  protected firstUpdated(_changedProperties: PropertyValues)
  {
    super.firstUpdated(_changedProperties);
    this.formControlController.updateValidity();

    if(this.options && Object.keys(this.options).length > 0)
    {
      this.value = Object.keys(this.options).find(key => this.options[key] === this.value) || this.value;
    }

    // If we don't have a default value, set the value to the default value
    if(!this.defaultValue)
    {
      this.defaultValue = this.value;
    }
  }

  private _handleBlur()
  {
    this.hasFocus = false;
  }

  private _handleEditClick(e)
  {
    if(this.disabled)
    {
      return;
    }

    e.preventDefault();
    this.isEditing = true;
    // Add event listener for esc key
    this.addEventListener('keydown', this.escKeyHandler);
  }

  private _handleInput(e: Event)
  {
    this.value = (e.target as (HTMLInputElement | HTMLSelectElement)).value;
  }

  private _handleSubmitClick(e)
  {
    e.preventDefault();
    this.isEditing = false;
    this.formControlController.submit();
  }

  private _handleCancelClick(e)
  {
    e.preventDefault();
    this.isEditing = false;
    this.value = this.defaultValue;
    this.requestUpdate();
  }

  escKeyHandler(e: KeyboardEvent)
  {
    if(e.key === 'Escape')
    {
      this.isEditing = false;
      this.value = this.defaultValue;

      this.removeEventListener('keydown', this.escKeyHandler);
    }
  }


  protected render()
  {
    let input = html`<input type="text" class="ai__input" value="${this.value}"
                            .disabled="${!this.isEditing}"
                            @input="${this._handleInput}"
                            @blur="${this._handleBlur}"/>`;

    if(Object.keys(this.options).length > 0)
    {
      input = html`<select class="ai__input"
                           .disabled="${!this.isEditing}"
                           @input="${this._handleInput}"
                           @blur="${this._handleBlur}">
        ${Object.keys(this.options).map(key => html`
          <option value="${key}" ?selected="${this.value == key || this.value == this.options[key]}">
            ${this.options[key]}
          </option>`)}
      </select>`;
    }

    const slotHasContent = this.slotController.test('[default]');


    return html`
      <div class="${classMap({
        'ai': true,
        'ai--editing': this.isEditing,
        'ai--focused': this.hasFocus,
        'ai--disabled': this.disabled,
        'ai--horizontal': this.horizontal,
      })}">
        <span class="ai__caption" @click="${this._handleEditClick}">
          ${this.caption}
        </span>
        <div class="ai__wrapper">
          <div class="ai__left" @click="${this._handleEditClick}">
            <slot></slot>
            ${slotHasContent ? null : input}
          </div>
          <div class="ai__right">
            ${!this.isEditing ?
              html`
                <zn-button @click="${this._handleEditClick}" src="edit" color="transparent">Edit</zn-button>` :
              html`
                <zn-button type="submit" @click="${this._handleSubmitClick}" icon="check" icon-size="24"
                           color="transparent"></zn-button>
                <zn-button type="button" @click="${this._handleCancelClick}" icon="close" icon-size="24"
                           color="transparent"></zn-button>
              `}
          </div>
        </div>
      </div>`;
  }
}

