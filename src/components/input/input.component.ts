import { property } from 'lit/decorators.js';
import { html, PropertyValues, unsafeCSS } from 'lit';
import ZincElement, { ZincFormControl } from '../../internal/zinc-element';
import { FormControlController, validValidityState } from "../../internal/form";

import styles from './input.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/input
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
export default class ZnInput extends ZincElement implements ZincFormControl {
  static styles = unsafeCSS(styles);

  private readonly formControlController = new FormControlController(this, {});

  private input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

  @property({ reflect: true }) for: string;
  @property({ reflect: true }) label: string;
  @property({ reflect: true }) class: string;
  @property({ reflect: true }) advice: string;
  @property({ reflect: true }) summary: string;
  @property({ reflect: true }) prefix: string;
  @property({ reflect: true }) suffix: string;

  @property({ reflect: true }) size: 'small' | 'medium' | 'large' = 'medium';

  @property() name: string = "";
  @property() value: string;

  @property({ type: Boolean, attribute: 'no-style' }) noStyle: boolean = false;

  get validity() {
    if (!this.input) {
      return validValidityState;
    }
    return this.input.validity;
  }

  get validationMessage() {
    return this.input.validationMessage;
  }

  connectedCallback() {
    super.connectedCallback();
    this.input = this.querySelector('input') as HTMLInputElement || this.querySelector('textarea') as HTMLTextAreaElement
      || this.querySelector('select') as HTMLSelectElement;
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    return this.formControlController.updateValidity();
  }

  checkValidity(): boolean {
    if (!this.input) {
      return true;
    }
    return this.input.checkValidity();
  }

  getForm(): HTMLFormElement | null {
    return this.formControlController.getForm();
  }

  reportValidity(): boolean {
    if (!this.input) {
      return true;
    }

    return this.input.reportValidity();
  }

  setCustomValidity(message: string): void {
    if (this.input) {
      this.input.setCustomValidity(message);
    }
    this.formControlController.updateValidity();
  }

  private handleClick() {
    this.querySelector('input')?.focus();
  }

  render() {
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
