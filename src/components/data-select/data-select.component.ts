import {
  colorDataProvider,
  countryDataProvider,
  countryDialPrefixDataProvider,
  currencyDataProvider,
  type DataProviderOption,
  emptyDataProvider,
  type LocalDataProvider,
} from "./providers/provider";
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {FormControlController} from "../../internal/form";
import {ifDefined} from "lit/directives/if-defined.js";
import {property, query} from 'lit/decorators.js';
import {watch} from "../../internal/watch";
import ZincElement from '../../internal/zinc-element';
import type {ZincFormControl} from '../../internal/zinc-element';
import type ZnSelect from "../select";

import styles from './data-select.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/data-select
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
export default class ZnDataSelect extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);

  protected readonly formControlController = new FormControlController(this);

  @query('#select') select: ZnSelect;
  @query('#select__prefix') selectPrefix: HTMLElement;

  /** The name of the select. Used for form submission. */
  @property() name: string;

  /** The value of the select. Used for form submission. */
  @property() value: string;

  /** The provider of the select. */
  @property() provider: 'color' | 'currency' | 'country' | 'phone';

  @property({attribute: 'icon-position'}) iconPosition: 'start' | 'end' | 'none' = 'none';

  /** An array of keys to use for filtering the options in the selected provider. */
  @property({
    attribute: 'filter',
    converter: {
      fromAttribute: (value: string) => value.split(','),
      toAttribute: (value: string[]) => value.join(',')
    }
  }) filter: string[];

  /** The selects size. */
  @property({reflect: true}) size: 'small' | 'medium' | 'large' = 'medium';

  /** Should we show the clear button */
  @property({type: Boolean}) clearable: boolean;

  /** The selects label. If you need to display HTML, use the `label` slot instead. */
  @property() label = '';

  /** Text that appears in a tooltip next to the label. If you need to display HTML in the tooltip, use the `label-tooltip` slot instead. */
  @property({attribute: 'label-tooltip'}) labelTooltip = '';

  /** Text that appears above the input, on the right, to add additional context. If you need to display HTML in this text, use the `context-note` slot instead. */
  @property({attribute: 'context-note'}) contextNote = '';

  /**
   * The preferred placement of the selects menu. Note that the actual placement may vary as needed to keep the listbox
   * inside the viewport.
   */
  @property({reflect: true}) placement: 'top' | 'bottom' = 'bottom';

  /** The selects help text. If you need to display HTML, use the `help-text` slot instead. */
  @property({attribute: 'help-text'}) helpText = '';

  /** The selects required attribute. */
  @property({type: Boolean, reflect: true}) required = false;

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('keydown', this.closeOnTab);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('keydown', this.closeOnTab);
  }

  get validationMessage() {
    return this.select.validationMessage;
  }

  get validity(): ValidityState {
    return this.select.validity;
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
    return this.select.setCustomValidity(message);
  }

  closeOnTab = (e: KeyboardEvent) => {
    if (this.select.open && e.key === 'Tab') {
      this.select.hide();
    }
  }

  @watch('value', {waitUntilFirstUpdate: true})
  async handleValueChange() {
    await this.updateComplete;
    this.formControlController.updateValidity();
    this._updatePrefix();
  }

  private _updatePrefix() {
    // Set the prefix of the select to the selected values prefix
    const selectedOption = this.select.selectedOptions[0];
    if (selectedOption && (this.iconPosition !== 'none')) {
      const slot = this.iconPosition === 'start'
        ? selectedOption.querySelector('[slot="prefix"]')
        : selectedOption.querySelector('[slot="suffix"]');

      if (slot) {
        this.selectPrefix.innerHTML = '';
        this.selectPrefix.appendChild(slot.cloneNode(true));
      } else {
        this.selectPrefix.innerHTML = '';
      }
    } else {
      this.selectPrefix.innerHTML = '';
    }
  }

  handleInput = (e: Event) => {
    this.value = (e.target as (HTMLInputElement | HTMLSelectElement)).value;
  };

  handleClear = () => {
    this.value = '';
  }

  getLocalProvider(name: string): LocalDataProvider<DataProviderOption> {
    switch (name) {
      case 'color':
        return colorDataProvider;
      case 'currency':
        return currencyDataProvider;
      case 'country':
        return countryDataProvider;
      case 'phone':
        return countryDialPrefixDataProvider;
      default:
        return emptyDataProvider;
    }
  }

  blur = () => {
    this.select.blur();
  }

  protected render() {
    const localProvider = this.getLocalProvider(this.provider);
    const filterKeys = this.filter || [];
    let data = localProvider.getData;

    if (filterKeys.length) {
      data = localProvider.getData.filter(item => filterKeys.includes(item.key));
    }

    return html`
      <zn-select id="select"
                 clearable="${ifDefined(this.clearable)}"
                 size="${this.size}"
                 label="${this.label}"
                 label-tooltip="${this.labelTooltip}"
                 context-note="${this.contextNote}"
                 help-text="${this.helpText}"
                 required=${ifDefined(this.required)}
                 placement="${this.placement}"
                 name="${this.name}"
                 @zn-input="${this.handleInput}"
                 @zn-clear="${this.handleClear}"
                 @blur=${this.blur}
                 value="${this.value}"
                 placeholder="Choose a ${localProvider.getName}"
                 exportparts="combobox,expand-icon,form-control-help-text,form-control-input">
        ${this.iconPosition !== 'none' ? html`
          <div id="select__prefix" slot="prefix" class="select__prefix"></div>` : ''}
        ${data.map((item: DataProviderOption) => html`
          <zn-option class="select__option" value="${item.key}">
            ${this.iconPosition !== 'none' ? html`<span
              slot="${this.iconPosition === 'end' ? 'suffix' : 'prefix'}">${item.prefix}</span>` : ''}
            ${item.value}
          </zn-option>`)}
      </zn-select>`;
  }
}
