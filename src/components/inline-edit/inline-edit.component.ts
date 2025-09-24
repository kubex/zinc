import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, type HTMLTemplateResult, unsafeCSS} from 'lit';
import {defaultValue} from "../../internal/default-value";
import {FormControlController} from "../../internal/form";
import {ifDefined} from "lit/directives/if-defined.js";
import {property, query, state} from 'lit/decorators.js';
import {watch} from "../../internal/watch";
import type {ZincFormControl} from '../../internal/zinc-element';
import ZincElement from '../../internal/zinc-element';
import ZnSelect from "../select";
import type ZnInput from "../input";

import styles from './inline-edit.scss';

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

  @property({reflect: true}) size: 'small' | 'medium' | 'large' = 'medium';

  @property({type: Boolean}) required: boolean

  @property() pattern: string;

  @property({attribute: "input-type"}) inputType: 'select' | 'text' | 'data-select' | 'number' = 'text';

  @property({type: Object}) options: { [key: string]: string } = {};

  @property({attribute: 'provider'}) selectProvider: string;

  @property({attribute: 'icon-position', type: Boolean}) iconPosition: 'start' | 'end' | 'none' = 'none';

  /** The input's help text. If you need to display HTML, use the `help-text` slot instead. **/
  @property({attribute: 'help-text'}) helpText: string = '';


  @state() private hasFocus: boolean;

  @state() private isEditing: boolean;

  @query('.ai__input') input: ZnInput | ZnSelect;

  @defaultValue('value') defaultValue: string;

  get validity(): ValidityState {
    return this.input?.validity;
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
    document.addEventListener('keydown', this.submitKeyHandler);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this.escKeyHandler);
    document.removeEventListener('keydown', this.submitKeyHandler);
  }

  async firstUpdated() {
    await this.updateComplete;
    this.input.addEventListener('onclick', this.handleEditClick);
  }

  @watch('value', {waitUntilFirstUpdate: true})
  async handleValueChange() {
    await this.updateComplete;
    this.formControlController.updateValidity();
  }

  @watch('isEditing', {waitUntilFirstUpdate: true})
  async handleIsEditingChange() {
    await this.updateComplete;
    if (this.input instanceof ZnSelect && !this.isEditing) {
      await this.input.hide();
    }
  }

  escKeyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.isEditing) {
      this.isEditing = false;
      this.value = this.defaultValue;
      this.input.blur();
    }
  };

  submitKeyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && this.isEditing) {
      this.isEditing = false;
      this.formControlController.submit();
      this.input.blur();
    }
  }

  handleEditClick = () => {
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

    // Default input type to select if options are provided
    if (Object.keys(this.options).length > 0) {
      this.inputType = 'select';
    }

    // Default to data-select if provider is provided
    if (this.selectProvider) {
      this.inputType = 'data-select';
    }

    let input: HTMLTemplateResult;
    switch (this.inputType) {
      case 'select':
        input = this._getSelectInput();
        break;
      case 'data-select':
        input = this._getDataSelectInput();
        break;
      case 'number':
        input = this._getNumberInput();
        break;
      default:
        input = this._getTextInput();
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
                <zn-button @click="${this.handleEditClick}"
                           class="button--edit"
                           icon="edit"
                           size="x-small"
                           icon-size="20"
                           color="secondary"></zn-button>`}` :
            html`
              <zn-button type="submit" @click="${this.handleSubmitClick}" icon="check" size="x-small" icon-size="20"
                         color="secondary"></zn-button>
              <zn-button type="button" @click="${this.handleCancelClick}" icon="close" size="x-small" icon-size="20"
                         color="secondary"></zn-button>`}
        </div>
      </div>`;
  }


  protected _getTextInput(): HTMLTemplateResult {
    return html`
      <zn-input type="text"
                class="ai__input"
                name="${this.name}"
                size="${this.size}"
                value="${this.value}"
                help-text="${ifDefined(this.helpText)}"
                pattern=${ifDefined(this.pattern)}
                @zn-input="${this.handleInput}"
                @zn-blur="${this.handleBlur}">
      </zn-input>`;
  }

  protected _getNumberInput(): HTMLTemplateResult {
    return html`
      <zn-input type="number"
                class="ai__input"
                name="${this.name}"
                size="${this.size}"
                value="${this.value}"
                help-text="${ifDefined(this.helpText)}"
                pattern=${ifDefined(this.pattern)}
                @zn-input="${this.handleInput}"
                @zn-blur="${this.handleBlur}">
      </zn-input>`;
  }

  protected _getSelectInput(): HTMLTemplateResult {
    return html`
      <zn-select class="ai__input"
                 name="${this.name}"
                 value="${this.value}"
                 help-text="${ifDefined(this.helpText)}"
                 size="${this.size}"
                 placeholder=" ${this.placeholder}"
                 @zn-input="${this.handleInput}"
                 @zn-blur="${this.handleBlur}">
        ${Object.keys(this.options).map(key => html`
          <zn-option value="${key}">
            ${this.options[key]}
          </zn-option>`)}
      </zn-select>`
  }

  protected _getDataSelectInput(): HTMLTemplateResult {
    return html`
      <zn-data-select class="ai__input"
                      name="${this.name}"
                      value="${this.value}"
                      icon-position="${ifDefined(this.iconPosition)}"
                      help-text="${ifDefined(this.helpText)}"
                      size="${this.size}"
                      provider="${this.selectProvider}"
                      @zn-input="${this.handleInput}"
                      @zn-blur="${this.handleBlur}">
      </zn-data-select>`;
  }
}
