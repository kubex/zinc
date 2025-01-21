import {ZincElement, ZincFormControl} from "../../zinc-element";
import {FormControlController, validValidityState} from "../../form";

import {html, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {PropertyValues} from "@lit/reactive-element";

import styles from './index.scss?inline';

@customElement('zn-input')
export class Input extends ZincElement implements ZincFormControl
{
  static styles = unsafeCSS(styles);

  private readonly formControlController = new FormControlController(this, {});

  private input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

  @property({type: String, reflect: true}) for;
  @property({type: String, reflect: true}) label;
  @property({type: String, reflect: true}) class;
  @property({type: String, reflect: true}) advice;
  @property({type: String, reflect: true}) summary;
  @property({type: String, reflect: true}) prefix;
  @property({type: String, reflect: true}) suffix;

  @property({type: String, reflect: true}) size: 'small' | 'medium' | 'large' = 'medium';

  @property() name: string = "";
  @property() value: string;

  @property({type: Boolean, attribute: 'no-style'}) noStyle: boolean = false;

  get validity()
  {
    if(!this.input)
    {
      return validValidityState;
    }
    return this.input.validity;
  }

  get validationMessage()
  {
    return this.input.validationMessage;
  }

  connectedCallback()
  {
    this.input = this.querySelector('input') || this.querySelector('textarea') || this.querySelector('select');
    super.connectedCallback();
  }

  protected firstUpdated(_changedProperties: PropertyValues)
  {
    return this.formControlController.updateValidity();
  }

  checkValidity(): boolean
  {
    if(!this.input)
    {
      return true;
    }
    return this.input.checkValidity();
  }

  getForm(): HTMLFormElement | null
  {
    return this.formControlController.getForm();
  }

  reportValidity(): boolean
  {
    if(!this.input)
    {
      return true;
    }

    return this.input.reportValidity();
  }

  setCustomValidity(message: string): void
  {
    if(this.input)
    {
      this.input.setCustomValidity(message);
    }
    this.formControlController.updateValidity();
  }

  private handleClick()
  {
    this.querySelector('input').focus();
  }

  render()
  {
    return html`
      ${this.label ? html`<label for="${this.for}">${this.label}</label>` : ''}
      ${this.summary}
      <div class="wrap">
        ${this.prefix ? html`<span @click="${this.handleClick}" class="prefix">${this.prefix}</span>` : ''}
        <slot part="input" class="input"></slot>
        ${this.suffix ? html`<span @click="${this.handleClick}" class="suffix">${this.suffix}</span>` : ''}
      </div>
      <span class="advice">${this.advice}</span>
    `;
  }
}

