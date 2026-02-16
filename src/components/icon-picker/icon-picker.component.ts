import {type CSSResultGroup, html, nothing, unsafeCSS} from 'lit';
import {defaultValue} from '../../internal/default-value';
import {property} from 'lit/decorators.js';
import {FormControlController} from '../../internal/form';
import ZincElement from '../../internal/zinc-element';
import ZnIcon from '../icon';
import type {ZincFormControl} from '../../internal/zinc-element';

import styles from './icon-picker.scss';

export default class ZnIconPicker extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-icon': ZnIcon
  };

  private readonly formControlController = new FormControlController(this, {
    assumeInteractionOn: ['zn-change']
  });

  @property() name = '';
  @property() icon = '';
  @property() label = '';
  @property() library: string = 'material';
  @property() color: string = '';
  @property({type: Boolean, attribute: 'no-color'}) noColor: boolean = false;
  @property({type: Boolean, attribute: 'no-library'}) noLibrary: boolean = false;
  @property({attribute: 'help-text'}) helpText: string = '';
  @property({type: Boolean, reflect: true}) disabled = false;
  @property({type: Boolean, reflect: true}) required = false;
  @property({reflect: true}) form: string;

  @defaultValue() defaultValue = '';

  get value(): string {
    return this.icon;
  }

  set value(val: string) {
    this.icon = val;
  }

  get validity(): ValidityState {
    if (this.required && !this.icon) {
      return {
        valid: false,
        valueMissing: true,
        badInput: false, customError: false, patternMismatch: false,
        rangeOverflow: false, rangeUnderflow: false, stepMismatch: false,
        tooLong: false, tooShort: false, typeMismatch: false,
      } as ValidityState;
    }
    return {
      valid: true, valueMissing: false, badInput: false, customError: false,
      patternMismatch: false, rangeOverflow: false, rangeUnderflow: false,
      stepMismatch: false, tooLong: false, tooShort: false, typeMismatch: false,
    } as ValidityState;
  }

  get validationMessage(): string {
    return this.required && !this.icon ? 'Please select an icon.' : '';
  }

  checkValidity(): boolean { return this.validity.valid; }
  getForm(): HTMLFormElement | null { return this.formControlController.getForm(); }
  reportValidity(): boolean { return this.checkValidity(); }
  setCustomValidity(_message: string) { this.formControlController.updateValidity(); }

  private _handleTriggerClick() {
    if (this.disabled) {
      return;
    }
    // Placeholder for dialog opening in Task 3
  }

  private _handleTriggerKeyDown(event: KeyboardEvent) {
    if (this.disabled) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this._handleTriggerClick();
    }
  }

  render() {
    const hasLabel = !!this.label;
    const hasHelpText = !!this.helpText;
    const hasIcon = !!this.icon;

    return html`
      <div part="form-control"
           class="form-control ${hasLabel ? 'form-control--has-label' : ''} ${hasHelpText ? 'form-control--has-help-text' : ''}">

        <label part="form-control-label" class="form-control__label"
               aria-hidden=${hasLabel ? 'false' : 'true'}>
          ${this.label}
        </label>

        <div part="form-control-input" class="form-control-input">
          <div
            part="trigger"
            class="icon-picker__trigger ${this.disabled ? 'icon-picker__trigger--disabled' : ''}"
            role="button"
            tabindex=${this.disabled ? '-1' : '0'}
            aria-disabled=${this.disabled ? 'true' : 'false'}
            @click=${this._handleTriggerClick}
            @keydown=${this._handleTriggerKeyDown}>
            ${hasIcon
              ? html`
                <zn-icon
                  src=${this.icon}
                  library=${this.library}
                  style=${this.color ? `color: ${this.color}` : ''}
                  size=${24}
                ></zn-icon>
                <span class="icon-picker__edit-text">Click to edit</span>`
              : html`
                <span class="icon-picker__placeholder">Set an icon</span>`
            }
          </div>
        </div>

        <input type="hidden" name="${this.name}[icon]" .value=${this.icon}>
        ${!this.noLibrary ? html`<input type="hidden" name="${this.name}[library]" .value=${this.library}>` : nothing}
        ${!this.noColor ? html`<input type="hidden" name="${this.name}[color]" .value=${this.color}>` : nothing}

        <div
          part="form-control-help-text"
          class="form-control__help-text"
          aria-hidden=${hasHelpText ? 'false' : 'true'}>
          ${this.helpText}
        </div>

      </div>`;
  }
}
