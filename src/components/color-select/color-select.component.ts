import {colors} from "../data-select/providers/color-data-provider";
import {type CSSResultGroup, html, nothing, unsafeCSS} from 'lit';
import {FormControlController} from "../../internal/form";
import {property, query} from 'lit/decorators.js';
import {watch} from "../../internal/watch";
import ZincElement from '../../internal/zinc-element';
import ZnOption from "../option";
import ZnSelect from "../select";
import type {ZincFormControl} from '../../internal/zinc-element';

import styles from './color-select.scss';

/**
 * @summary A simple color picker. The dropdown lists color swatches with names; the closed control shows only the selected color's swatch.
 * @documentation https://zinc.style/components/color-select
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-select
 * @dependency zn-option
 *
 * @event zn-input - Emitted when the selected color changes.
 * @event zn-clear - Emitted when the clear button is activated.
 *
 * @csspart swatch - The color swatch shown in the closed control.
 * @csspart combobox - The container that wraps the swatch and expand button (forwarded from zn-select).
 * @csspart form-control-help-text - The help text's wrapper (forwarded from zn-select).
 * @csspart form-control-input - The select's wrapper (forwarded from zn-select).
 */
export default class ZnColorSelect extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-select': ZnSelect,
    'zn-option': ZnOption,
  };

  @query('#select') select: ZnSelect;

  /** The name of the select. Used for form submission. */
  @property() name: string;

  /** The selected color (lowercase name, e.g. "red"). Used for form submission. */
  @property() value = '';

  /** The select's label. */
  @property() label = '';

  /** The select's help text. */
  @property({attribute: 'help-text'}) helpText = '';

  /** Disables the select. */
  @property({type: Boolean, reflect: true}) disabled = false;

  /** Makes the select a required field. */
  @property({type: Boolean, reflect: true}) required = false;

  /** Shows a clear button when a color is selected. */
  @property({type: Boolean}) clearable = false;

  private readonly formControlController = new FormControlController(this);

  get validity(): ValidityState {
    return this.select.validity;
  }

  get validationMessage(): string {
    return this.select.validationMessage;
  }

  checkValidity(): boolean {
    return this.select.checkValidity();
  }

  getForm(): HTMLFormElement | null {
    return this.formControlController.getForm();
  }

  reportValidity(): boolean {
    return this.select.reportValidity();
  }

  setCustomValidity(message: string): void {
    this.select.setCustomValidity(message);
  }

  @watch('value', {waitUntilFirstUpdate: true})
  handleValueChange() {
    this.formControlController.updateValidity();
  }

  private handleInput = (e: Event) => {
    const target = e.target as ZnSelect;
    this.value = (target.value as string) ?? '';
  };

  private handleClear = () => {
    this.value = '';
  };

  protected render() {
    return html`
      <zn-select id="select"
                 placement="bottom-start"
                 label="${this.label}"
                 help-text="${this.helpText}"
                 name="${this.name}"
                 clearable=${this.clearable || nothing}
                 required=${this.required || nothing}
                 ?disabled="${this.disabled}"
                 .value="${this.value}"
                 @zn-input="${this.handleInput}"
                 @zn-clear="${this.handleClear}"
                 exportparts="combobox,form-control-help-text,form-control-input">
        <div slot="prefix" part="swatch"
             class="color-swatch ${this.value ? `color-swatch--${this.value}` : 'color-swatch--empty'}"></div>
        ${colors.map(color => html`
          <zn-option value="${color.toLowerCase()}">
            <div slot="prefix" class="color-swatch color-swatch--${color.toLowerCase()}"></div>
            ${color}
          </zn-option>`)}
      </zn-select>`;
  }
}
