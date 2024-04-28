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
    defaultValue: (control: InlineEdit) => control.defaultValue,
  });

  @state() private hasFocus = false;
  @state() private isEditing = false;

  @query('.ai__input') input: HTMLInputElement | HTMLSelectElement;

  @property({ attribute: 'caption-size', reflect: true }) captionSize: 'small' | 'medium' | 'large' = 'medium';
  @property() value: string;
  @property() name: string;
  @property({ attribute: 'default-value' }) defaultValue: string;
  @property() caption: string = ""; // Caption

  @property({ attribute: 'options', type: Object }) options: { [key: string]: string } = {};


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
    this.value = (e.target as (HTMLInputElement | HTMLSelectElement)).value;
  }

  private _handleSubmitClick()
  {
    this.isEditing = false;
    this.getForm().submit();
  }

  private _handleCancelClick(e)
  {
    e.preventDefault();
    this.isEditing = false;
    this.value = this.defaultValue;
    this.requestUpdate();
  }


  protected render()
  {
    console.log('options', this.options);

    let input = html`<input type="text" class="ai__input" value="${this.value}"
                            @click="${this._handleEditClick}"
                            .disabled="${!this.isEditing}"
                            @input="${this._handleInput}"
                            @blur="${this._handleBlur}"/>`;

    if(Object.keys(this.options).length > 0)
    {
      input = html`<select class="ai__input" @click="${this._handleEditClick}"
                           .disabled="${!this.isEditing}"
                           @input="${this._handleInput}"
                           @blur="${this._handleBlur}">
        ${Object.keys(this.options).map(key => html`
          <option value="${key}" ?selected="${this.value == key}">${this.options[key]}</option>`)}
      </select>`;
    }

    return html`
      <div class="${classMap({
        'ai': true,
        'ai--editing': this.isEditing,
        'ai--focused': this.hasFocus
      })}">
        <span class="ai__caption">${this.caption}</span>
        <div class="ai__wrapper">
          <div class="ai__left">
            ${input}
          </div>
          <div class="ai__right">
            ${!this.isEditing ?
              html`
                <zn-button @click="${this._handleEditClick}" color="transparent">Edit
                </zn-button>` :
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

