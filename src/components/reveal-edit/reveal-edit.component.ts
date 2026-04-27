import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {defaultValue} from "../../internal/default-value";
import {FormControlController} from "../../internal/form";
import {property, query, state} from 'lit/decorators.js';
import {watch} from "../../internal/watch";
import ZincElement from '../../internal/zinc-element';
import type {ZincFormControl} from '../../internal/zinc-element';
import type ZnInput from "../input";

import styles from './reveal-edit.scss';

/**
 * @summary An inline-editable field that displays a masked value by default, reveals the real value on hover,
 * and switches to an editable input when the field or edit button is clicked.
 * @documentation https://zinc.style/components/reveal-edit
 * @status experimental
 * @since 1.0
 *
 * @event zn-input  - Emitted when the value changes during editing.
 * @event zn-submit - Emitted when the user saves the edited value.
 *
 * @csspart actions - The right-side actions container.
 *
 * @usage
 * ```html
 * <zn-reveal-edit name="email"
 *                 value="john@example.com"
 *                 display-value="j***@example.com">
 * </zn-reveal-edit>
 * ```
 */
export default class ZnRevealEdit extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);

  private readonly formControlController = new FormControlController(this, {
    defaultValue: (control: ZnRevealEdit) => control.defaultValue,
    value: (control: ZnRevealEdit) => control.value,
  });

  /** The real value — used in the edit input and submitted with the form. */
  @property() value: string = '';

  /** The masked value shown in display mode. On hover/click the real value is revealed temporarily. */
  @property({attribute: 'display-value'}) displayValue: string = '';

  /** The form field name. */
  @property() name: string;

  /** Disables editing. */
  @property({type: Boolean}) disabled: boolean;

  /**
   * When set, the edit input starts empty instead of pre-filled with the current value.
   * Cancelling restores the original value. Use this when the displayed value is masked and
   * pre-filling would leak the mask into the form submission.
   */
  @property({type: Boolean, attribute: 'clear-on-edit'}) clearOnEdit: boolean = false;

  @state() private isEditing: boolean = false;
  @state() private _isRevealed: boolean = false;

  private _valueBeforeEdit: string;
  private _editStartValue: string;

  @query('.re__input') input: ZnInput;

  @defaultValue('value') defaultValue: string;

  get validity(): ValidityState {
    return this.input?.validity;
  }

  get validationMessage(): string {
    return this.input?.validationMessage ?? '';
  }

  checkValidity(): boolean {
    return this.input?.checkValidity() ?? true;
  }

  getForm(): HTMLFormElement | null {
    return this.formControlController.getForm();
  }

  reportValidity(): boolean {
    return this.input?.reportValidity() ?? true;
  }

  setCustomValidity(message: string): void {
    this.input?.setCustomValidity(message);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this._escKeyHandler);
    document.addEventListener('keydown', this._submitKeyHandler);
    document.addEventListener('click', this._mouseEventHandler);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._escKeyHandler);
    document.removeEventListener('keydown', this._submitKeyHandler);
    document.removeEventListener('click', this._mouseEventHandler);
  }

  @watch('value', {waitUntilFirstUpdate: true})
  async handleValueChange() {
    await this.updateComplete;
    this.formControlController.updateValidity();
  }

  private _mouseEventHandler = (e: MouseEvent) => {
    if(this.isEditing && !this.contains(e.target as Node))
    {
      if(this.value === this._editStartValue)
      {
        this.isEditing = false;
        this.value = this._valueBeforeEdit;
        this.input?.blur();
      }
    }
  };

  private _escKeyHandler = (e: KeyboardEvent) => {
    if(e.key === 'Escape' && this.isEditing)
    {
      this.isEditing = false;
      this.value = this._valueBeforeEdit;
      this.input?.blur();
    }
  };

  private _submitKeyHandler = (e: KeyboardEvent) => {
    if(e.key === 'Enter' && this.isEditing && !e.shiftKey)
    {
      this.isEditing = false;
      this.emit('zn-submit', {detail: {value: this.value, element: this}});
      this.formControlController.submit();
      this.input?.blur();
    }
  };

  private _handleMouseEnter = () => {
    if(!this.isEditing)
    {
      this._isRevealed = true;
    }
  };

  private _handleMouseLeave = () => {
    if(!this.isEditing)
    {
      this._isRevealed = false;
    }
  };

  private _handleEditClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if(this.disabled) return;

    this._isRevealed = false;
    this._valueBeforeEdit = this.value;
    if(this.clearOnEdit)
    {
      this.value = '';
    }
    this._editStartValue = this.value;
    this.isEditing = true;
  };

  private _handleSubmitClick = (e: MouseEvent) => {
    e.preventDefault();
    this.isEditing = false;
    this.emit('zn-submit', {detail: {value: this.value, element: this}});
    this.formControlController.submit();
  };

  private _handleCancelClick = (e: MouseEvent) => {
    e.preventDefault();
    this.isEditing = false;
    this.value = this._valueBeforeEdit;
  };

  private _handleInput = (e: Event) => {
    if(this.disabled || !this.isEditing) return;
    this.value = (e.target as HTMLInputElement).value;
    this.emit('zn-input');
  };

  render() {
    const displayText = this._isRevealed ? this.value : this.displayValue;

    return html`
      <div class="${classMap({
        're': true,
        're--editing': this.isEditing,
        're--revealed': this._isRevealed,
        're--disabled': this.disabled,
      })}" dir="ltr">

        <div class="re__left">
          <div class="re__display"
               @mouseenter="${this._handleMouseEnter}"
               @mouseleave="${this._handleMouseLeave}"
               @click="${this.disabled ? undefined : this._handleEditClick}">
            ${displayText}
          </div>
          <zn-input type="text"
                    class="re__input"
                    name="${this.name}"
                    value="${this.value}"
                    @zn-input="${this._handleInput}">
          </zn-input>
        </div>

        <div class="re__right" part="actions">
          ${!this.isEditing ? html`
            <zn-button @click="${this.disabled ? undefined : this._handleEditClick}"
                       class="button--edit"
                       icon="edit"
                       size="x-small"
                       icon-size="20"
                       color="secondary"></zn-button>
          ` : html`
            <zn-button type="submit"
                       @click="${this._handleSubmitClick}"
                       icon="check"
                       size="x-small"
                       icon-size="20"
                       color="secondary"></zn-button>
            <zn-button type="button"
                       @click="${this._handleCancelClick}"
                       icon="close"
                       size="x-small"
                       icon-size="20"
                       color="secondary"></zn-button>
          `}
        </div>

      </div>`;
  }
}
