import { ZincElement, ZincFormControl } from "../../zinc-element";
import { FormControlController } from "../../form";

import { html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { PropertyValues } from "@lit/reactive-element";

import styles from './index.scss';

@customElement('zn-input')
export class Input extends ZincElement implements ZincFormControl
{
  static styles = unsafeCSS(styles);

  private readonly formControlController = new FormControlController(this, {});

  private input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

  @property({ type: String, reflect: true }) for;
  @property({ type: String, reflect: true }) label;
  @property({ type: String, reflect: true }) class;
  @property({ type: String, reflect: true }) advice;
  @property({ type: String, reflect: true }) summary;
  @property({ type: String, reflect: true }) prefix;
  @property({ type: String, reflect: true }) suffix;

  @property() name: string = "";
  @property() value: string;

  get validity()
  {
    return this.input.validity;
  }

  get validationMessage()
  {
    return this.input.validationMessage;
  }

  protected connectedCallback()
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

  private handleClick()
  {
    this.querySelector('input').focus();
  }

  render()
  {
    return html`
      <label for="${this.for}">${this.label}</label>
      ${this.summary}
      <div class="wrap">
        ${this.prefix ? html`<span @click="${this.handleClick}" class="prefix">${this.prefix}</span>` : ''}
        <slot></slot>
        ${this.suffix ? html`<span @click="${this.handleClick}" class="suffix">${this.suffix}</span>` : ''}
      </div>
      <span class="advice">${this.advice}</span>
    `;
  }
}

