import {
  colorDataProvider,
  countryDataProvider,
  countryDialPrefixDataProvider,
  currencyDataProvider,
  type DataProviderOption,
  emptyDataProvider,
  type LocalDataProvider,
} from "./providers/provider";
import {type CSSResultGroup, html, nothing, type PropertyValues, unsafeCSS} from 'lit';
import {FormControlController} from "../../internal/form";
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

  @query('#select') select: ZnSelect;
  @query('#select__prefix') selectPrefix: HTMLElement;

  /** The name of the select. Used for form submission. */
  @property() name: string;

  /** The value of the select. Used for form submission. */
  @property() value: string;

  /** The provider of the select. */
  @property() provider: 'color' | 'currency' | 'country' | 'phone';

  /** The position of the icon. */
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

  /** Include an "All" option at the top. */
  @property({type: Boolean, attribute: 'allow-all'}) allowAll = false;

  /** Include a "Common" option that selects multiple common currencies. */
  @property({type: Boolean, attribute: 'allow-common'}) allowCommon = false;

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

  @property({attribute: "icon-only", type: Boolean, reflect: true}) iconOnly = false;

  @property({type: Boolean}) multiple = false;

  protected readonly formControlController = new FormControlController(this);

  get validationMessage() {
    return this.select.validationMessage;
  }

  get validity(): ValidityState {
    return this.select.validity;
  }

  constructor() {
    super();
    if (this.iconOnly && this.iconPosition === 'none') {
      this.iconPosition = 'start';
    }
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('keydown', this.closeOnTab);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('keydown', this.closeOnTab);
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    this._updatePrefix();
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
        return currencyDataProvider(this.allowCommon);
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

    if (this.provider !== 'color' && this.allowAll) {
      const label = {
        currency: 'All Currencies',
        country: 'All Countries',
        phone: 'All Phones'
      }[this.provider] || 'All';
      const allOption: DataProviderOption = {key: '', value: label, prefix: ''};
      data = [allOption, ...data.filter(item => item.key !== allOption.key)];
    }

    return html`
      <zn-select id="select"
                 clearable=${this.clearable || nothing}
                 size="${this.size}"
                 label="${this.label}"
                 label-tooltip="${this.labelTooltip}"
                 context-note="${this.contextNote}"
                 help-text="${this.helpText}"
                 required=${this.required || nothing}
                 placement=${this.placement}
                 name="${this.name}"
                 @zn-input="${this.handleInput}"
                 @zn-clear="${this.handleClear}"
                 @blur=${this.blur}
                 value="${this.value}"
                 ?multiple=${this.multiple}
                 placeholder="${this.getPlaceholder(localProvider)}"
                 exportparts="combobox,expand-icon,form-control-help-text,form-control-input,display-input">
        ${(this.iconPosition !== 'none' || this.iconOnly) ? html`
          <div id="select__prefix" slot="prefix" class="select__prefix"></div>` : ''}
        ${data.map((item: DataProviderOption) => html`
          <zn-option class="select__option" value="${item.key}">
            ${(this.iconPosition !== 'none' || this.iconOnly) ? html`<span
              slot="${this.iconPosition === 'end' ? 'suffix' : 'prefix'}">${item.prefix}</span>` : ''}
            ${this.iconOnly ? undefined : item.value}
          </zn-option>`)}
      </zn-select>`;
  }

  private _updatePrefix() {
    // Set the prefix of the select to the selected values prefix
    const selectedOption = this.select.selectedOptions[0];
    if (selectedOption && (this.iconPosition !== 'none' || this.iconOnly) && this.selectPrefix) {
      if (this.iconPosition === 'none' && this.iconOnly) {
        this.iconPosition = 'start';
      }
      const slot = this.iconPosition === 'start'
        ? selectedOption.querySelector('[slot="prefix"]')
        : selectedOption.querySelector('[slot="suffix"]');
      if (slot) {
        this.selectPrefix.innerHTML = '';
        this.selectPrefix.appendChild(slot.cloneNode(true));
      } else {
        this.selectPrefix.innerHTML = '';
      }
    } else if (this.selectPrefix) {
      this.selectPrefix.innerHTML = '';
    }
  }

  private getPlaceholder(localProvider: LocalDataProvider<any>) {
    if (this.value) {
      return '';
    }

    return `Choose a ${localProvider.getName}`
  }
}
