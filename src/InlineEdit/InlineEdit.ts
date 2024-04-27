import { html, unsafeCSS } from "lit";
import { customElement, property, query, state } from 'lit/decorators.js';

import { ZincElement, ZincFormControl } from "../zinc-element";
import { FormControlController } from "../form";
import { PropertyValues } from "@lit/reactive-element";
import { classMap } from "lit/directives/class-map.js";

import styles from './index.scss';

@customElement('zn-inline-edit')
export class InlineEdit extends ZincElement implements ZincFormControl
{
  static styles = unsafeCSS(styles);

  private readonly formControlController = new FormControlController(this, {
    defaultValue: (control: InlineEdit) => control.value
  });

  @state() private hasFocus = false;
  @state() private isEditing = false;

  @query('input[type="text"]') input: HTMLInputElement;

  @property() value: string;
  @property() name: string;
  @property({ attribute: 'caption', type: String, reflect: true }) caption: string = ""; // Caption


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
  }

  private _handleBlur()
  {
    this.hasFocus = false;
  }

  private _handleEditClick()
  {
    this.isEditing = true;
  }

  private _handleInput(e: Event)
  {
    this.value = (e.target as HTMLInputElement).value;
  }

  private _handleSubmitClick()
  {
    this.isEditing = false;
  }

  private _handleCancelClick(e)
  {
    e.preventDefault();
    this.value = this.input.defaultValue;
    this.isEditing = false;
  }


  protected render()
  {
    return html`
      <div class="${classMap({
        'ai': true,
        'ai--editing': this.isEditing,
        'ai--focused': this.hasFocus
      })}">
        <span class="ai__caption">${this.caption}</span>
        <div class="ai__wrapper">
          <div class="ai__left">
            <input type="text" class="ai__input" value="${this.value}"
                   @click="${this._handleEditClick}"
                   .disabled="${!this.isEditing}"
                   @input="${this._handleInput}"
                   @blur="${this._handleBlur}"
          </div>
        </div>
        <div class="ai__right">
          ${!this.isEditing ?
            html`
              <zn-button @click="${this._handleEditClick}" icon="pencil" icon-size="24" color="transparent">Edit
              </zn-button>` :
            html`
              <zn-button type="submit" @click="${this._handleSubmitClick}" icon="check" icon-size="24"
                         color="transparent"></zn-button>
              <zn-button type="button" @click="${this._handleCancelClick}" icon="close" icon-size="24"
                         color="transparent"></zn-button>
            `}
        </div>
      </div>`;
  }
}

