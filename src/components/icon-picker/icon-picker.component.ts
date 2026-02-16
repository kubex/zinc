import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {defaultValue} from '../../internal/default-value';
import {property} from 'lit/decorators.js';
import {FormControlController} from '../../internal/form';
import ZincElement from '../../internal/zinc-element';
import type {ZincFormControl} from '../../internal/zinc-element';

import styles from './icon-picker.scss';

export default class ZnIconPicker extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);

  private readonly formControlController = new FormControlController(this, {
    assumeInteractionOn: ['zn-change']
  });

  @property() name = '';
  @property() icon = '';
  @property() label = '';
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

  render() {
    return html`<div>icon-picker placeholder</div>`;
  }
}
