import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, type HTMLTemplateResult, unsafeCSS} from 'lit';
import {defaultValue} from "../../internal/default-value";
import {FormControlController} from "../../internal/form";
import {HasSlotController} from "../../internal/slot";
import {ifDefined} from "lit/directives/if-defined.js";
import {property, query, state} from 'lit/decorators.js';
import {watch} from "../../internal/watch";
import ZincElement from '../../internal/zinc-element';
import ZnSelect from "../select";
import type {ZincFormControl} from '../../internal/zinc-element';
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
 * @slot help-text - Text that describes how to use the input. Alternatively, you can use the `help-text` attribute.
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
  private readonly hasSlotController = new HasSlotController(this, 'help-text');

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

  @property() min: string | number;

  @property() max: string | number;

  @property() step: number | 'any';

  @property({attribute: "input-type"}) inputType: 'select' | 'text' | 'data-select' | 'number' | 'textarea' = 'text';

  @property({type: Object}) options: { [key: string]: string } = {};

  @property({attribute: 'provider'}) selectProvider: string;

  @property({attribute: 'icon-position', type: Boolean}) iconPosition: 'start' | 'end' | 'none' = 'none';

  /** The input's help text. If you need to display HTML, use the `help-text` slot instead. **/
  @property({attribute: 'help-text'}) helpText: string = '';

  /** The text direction for the input (ltr or rtl) **/
  @property() dir: 'ltr' | 'rtl' | 'auto' = 'auto';

  /**
   * Specifies what permission the browser has to provide assistance in filling out form field values. Refer to
   * [this page on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete) for available values.
   */
  @property() autocomplete: string;

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
    document.addEventListener('click', this.mouseEventHandler);
    this.addEventListener('mousedown', this.captureMouseDown, {capture: true});
    this.addEventListener('keydown', this.captureKeyDown, {capture: true});
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this.escKeyHandler);
    document.removeEventListener('keydown', this.submitKeyHandler);
    document.removeEventListener('click', this.mouseEventHandler);
    this.removeEventListener('mousedown', this.captureMouseDown, true);
    this.removeEventListener('keydown', this.captureKeyDown, true);
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

  mouseEventHandler = (e: MouseEvent) => {
    if (this.isEditing && !this.contains(e.target as Node)) {
      this.isEditing = false;
      this.emit('zn-change');
      this.input.blur();
    }
  };

  escKeyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.isEditing) {
      this.isEditing = false;
      this.value = this.defaultValue;
      this.input.blur();
    }
  };

  submitKeyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && this.isEditing && !e.shiftKey) {
      this.isEditing = false;
      this.emit('zn-submit', {detail: {value: this.value, element: this}});
      this.formControlController.submit();
      this.input.blur();
    }
  }

  captureMouseDown = (e: MouseEvent) => {
    if (this.disabled && !this.isEditing) {
      e.stopPropagation();
    }
  }

  captureKeyDown = (e: KeyboardEvent) => {
    if (this.disabled && !this.isEditing) {
      e.stopPropagation();
      e.preventDefault();
    }
  }

  handleEditClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (this.disabled) {
      return;
    }
    this.isEditing = true;
  }

  handleSubmitClick = (e: MouseEvent) => {
    e.preventDefault();
    this.isEditing = false;
    this.emit('zn-submit', {detail: {value: this.value, element: this}});
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
    if (this.disabled || !this.isEditing) {
      return;
    }
    this.value = (e.target as (HTMLInputElement | HTMLSelectElement)).value;
    this.emit('zn-input');
  };

  protected render() {
    const hasEditText = this.editText;
    const hasHelpTextSlot = this.hasSlotController.test('help-text');
    const hasHelpText = this.helpText ? true : hasHelpTextSlot;

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
      case 'textarea':
        input = this._getTextAreaInput();
        break
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
      })}" dir="ltr">

        <div class="ai__left" @click="${this.disabled ? undefined : this.handleEditClick}">
          ${input}
        </div>

        <div class="ai__right" part="actions">
          ${!this.isEditing ?
            html`
              ${hasEditText ? html`
                <zn-button @click="${this.disabled ? undefined : this.handleEditClick}" size="x-small"
                           color="secondary">
                  ${this.editText}
                </zn-button>` : html`
                <zn-button @click="${this.disabled ? undefined : this.handleEditClick}"
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
      </div>

      ${this.isEditing && hasHelpText ? html`
        <div
          part="form-control-help-text"
          id="help-text"
          class="form-control__help-text"
          aria-hidden="false">
          <slot name="help-text">${this.helpText}</slot>
        </div>
      ` : ''}`;
  }


  protected _getTextAreaInput(): HTMLTemplateResult {
    return html`
      <zn-textarea
        class="ai__input"
        name="${this.name}"
        size="${this.size}"
        resize="auto"
        rows="1"
        .value="${this.value}"
        placeholder="${this.placeholder}"
        pattern=${ifDefined(this.pattern)}
        autocomplete=${ifDefined(this.autocomplete)}
        dir="${this.dir}"
        @zn-input="${this.handleInput}"
        @zn-blur="${this.handleBlur}">
      </zn-textarea>`;
  }

  protected _getTextInput(): HTMLTemplateResult {
    return html`
      <zn-input type="text"
                class="ai__input"
                name="${this.name}"
                size="${this.size}"
                value="${this.value}"
                placeholder="${this.placeholder}"
                pattern=${ifDefined(this.pattern)}
                autocomplete=${ifDefined(this.autocomplete)}
                required=${ifDefined(this.required)}
                dir="${this.dir}"
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
                placeholder="${this.placeholder}"
                pattern=${ifDefined(this.pattern)}
                autocomplete=${ifDefined(this.autocomplete)}
                min=${ifDefined(this.min)}
                max=${ifDefined(this.max)}
                step=${ifDefined(this.step)}
                required=${ifDefined(this.required)}
                dir="${this.dir}"
                @zn-input="${this.handleInput}"
                @zn-blur="${this.handleBlur}">
      </zn-input>`;
  }

  protected _getSelectInput(): HTMLTemplateResult {
    return html`
      <zn-select class="ai__input"
                 name="${this.name}"
                 value="${this.value}"
                 size="${this.size}"
                 placeholder="${this.placeholder}"
                 required=${ifDefined(this.required)}
                 dir="${this.dir}"
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
                      size="${this.size}"
                      provider="${this.selectProvider}"
                      required=${ifDefined(this.required)}
                      dir="${this.dir}"
                      @zn-input="${this.handleInput}"
                      @zn-blur="${this.handleBlur}">
      </zn-data-select>`;
  }
}
