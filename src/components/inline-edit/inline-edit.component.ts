import {property, query, state} from 'lit/decorators.js';
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import ZincElement, {ZincFormControl} from '../../internal/zinc-element';
import {FormControlController} from "../../internal/form";
import {classMap} from "lit/directives/class-map.js";

import styles from './inline-edit.scss';
import {defaultValue} from "../../internal/default-value";
import ZnInput from "../input";
import ZnSelect from "../select";
import {watch} from "../../internal/watch";

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/inline-edit
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
export default class ZnInlineEdit extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);

  private readonly formControlController = new FormControlController(this, {
    defaultValue: (control: ZnInlineEdit) => control.defaultValue,
  });

  @property({reflect: true}) value: string;

  @property() name: string;

  @property({reflect: true}) placeholder: string;

  @property({attribute: 'edit-text'}) editText: string;

  @property({type: Boolean}) disabled: boolean

  @property({type: Boolean}) inline: boolean

  @property({type: Boolean}) padded: boolean

  @property({type: Boolean}) required: boolean

  @property({type: Object}) options: { [key: string]: string } = {};

  @state() private hasFocus: boolean;

  @state() private isEditing: boolean;

  @query('.ai__input') input: ZnInput | ZnSelect;

  @defaultValue('value') defaultValue: string;

  get validity(): ValidityState {
    return this.input.validity;
  }

  get validationMessage(): string {
    return this.input.validationMessage;
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
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this.escKeyHandler);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this.escKeyHandler);
  }

  @watch('value', {waitUntilFirstUpdate: true})
  async handleValueChange() {
    await this.updateComplete;
    this.formControlController.updateValidity();
  }

  escKeyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.isEditing) {
      this.isEditing = false;
      this.value = this.defaultValue;
    }
  };

  handleEditClick = (e: MouseEvent) => {
    e.preventDefault();
    if (this.disabled) {
      return;
    }
    this.isEditing = true;
  }

  handleSubmitClick = (e: MouseEvent) => {
    e.preventDefault();
    this.isEditing = false;
    this.formControlController.submit();
  };

  handleCancelClick = (e: MouseEvent) => {
    e.preventDefault();
    this.isEditing = false;
    this.value = this.defaultValue;
  };

  handleBlur = () => {
    this.hasFocus = false;
  };

  handleInput = (e: Event) => {
    this.value = (e.target as (HTMLInputElement | HTMLSelectElement)).value;
  };


  protected render() {
    const hasEditText = this.editText;

    console.log('this.options', this.options);

    let input = html`
      <zn-input type="text"
                class="ai__input"
                name="${this.name}"
                value="${this.value}"
                @click="${this.handleEditClick}"
                .disabled="${!this.isEditing}"
                @zn-input="${this.handleInput}"
                @zn-blur="${this.handleBlur}">
      </zn-input>`;

    if (Object.keys(this.options).length > 0) {
      input = html`
        <zn-select class="ai__input"
                   name="${this.name}"
                   value="${this.value}"
                   placeholder="${this.placeholder}"
                   @click="${this.handleEditClick}"
                   .disabled="${!this.isEditing}"
                   @zn-input="${this.handleInput}"
                   @zn-blur="${this.handleBlur}">
          ${Object.keys(this.options).map(key => html`
            <zn-option value="${key}">
              ${this.options[key]}
            </zn-option>`)}
        </zn-select>`;
    }

    return html`
      <div class="${classMap({
        'ai': true,
        'ai--editing': this.isEditing,
        'ai--focused': this.hasFocus,
        'ai--disabled': this.disabled,
        'ai--inline': this.inline,
        'ai--padded': this.padded,
      })}">

        <div class="ai__left" @click="${this.handleEditClick}">
          ${input}
        </div>

        <div class="ai__right" part="actions">
          ${!this.isEditing ?
            html`
              ${hasEditText ? html`
                <zn-button @click="${this.handleEditClick}" size="x-small" color="secondary">
                  ${this.editText}
                </zn-button>` : html`
                <zn-button @click="${this.handleEditClick}" icon="edit" size="x-small" icon-size="20"
                           color="secondary"></zn-button>`}` :
            html`
              <zn-button type="submit" @click="${this.handleSubmitClick}" icon="check" size="x-small" icon-size="20"
                         color="secondary"></zn-button>
              <zn-button type="button" @click="${this.handleCancelClick}" icon="close" size="x-small" icon-size="20"
                         color="secondary"></zn-button>`}
        </div>
      </div>`;
  }
}
