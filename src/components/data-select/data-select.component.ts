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
import ZnOption from "../option";
import ZnSelect from "../select";
import type {ZincFormControl} from '../../internal/zinc-element';

import styles from './data-select.scss';

/**
 * @summary A select component with built-in data providers for common options like colors, currencies, and countries.
 * @documentation https://zinc.style/components/data-select
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-select
 * @dependency zn-option
 *
 * @event zn-input - Emitted when the select's value changes.
 * @event zn-clear - Emitted when the clear button is activated.
 * @event blur - Emitted when the select loses focus.
 *
 * @slot label - The select's label. Alternatively, you can use the `label` attribute.
 * @slot label-tooltip - Used to add text that is displayed in a tooltip next to the label. Alternatively, you can use the `label-tooltip` attribute.
 * @slot context-note - Used to add contextual text that is displayed above the select, on the right. Alternatively, you can use the `context-note` attribute.
 * @slot help-text - Text that describes how to use the select. Alternatively, you can use the `help-text` attribute.
 *
 * @csspart combobox - The container that wraps the prefix, combobox, clear icon, and expand button (forwarded from zn-select).
 * @csspart expand-icon - The container that wraps the expand icon (forwarded from zn-select).
 * @csspart form-control-help-text - The help text's wrapper (forwarded from zn-select).
 * @csspart form-control-input - The select's wrapper (forwarded from zn-select).
 * @csspart display-input - The element that displays the selected option's label (forwarded from zn-select).
 */
export default class ZnDataSelect extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-select': ZnSelect,
    'zn-option': ZnOption,
  };

  @query('#select') select: ZnSelect;

  /** The name of the select. Used for form submission. */
  @property() name: string;

  /** The value of the select. Used for form submission. When `multiple` is enabled, this is an array of strings. */
  @property() value: string | string[] = '';

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

  @property() distinct = "";

  @property() conditional = "";

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

  protected async firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);

    if (this.select) {
      await this.select.updateComplete;
      this.select.addEventListener('zn-change', () => {
        this._updatePrefix();
      });
    }
    this._updatePrefix();
  }

  protected async updated(_changedProperties: PropertyValues) {
    super.updated(_changedProperties);

    if (_changedProperties.has('value') ||
      _changedProperties.has('provider') ||
      _changedProperties.has('iconPosition')) {
      if (this.select) {
        await this.select.updateComplete;
      }
      this._updatePrefix();
    }
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
      this.select.hide().then();
    }
  }

  @watch('value', {waitUntilFirstUpdate: true})
  async handleValueChange() {
    await this.updateComplete;
    this.formControlController.updateValidity();
    if (this.select) {
      await this.select.updateComplete;
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    this._updatePrefix();
  }

  handleInput = (e: Event) => {
    const target = e.target as ZnSelect;
    this.value = target.value ?? (this.multiple ? [] : '');
  };

  handleClear = () => {
    this.value = this.multiple ? [] : '';
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
      const normalizedFilterKeys = filterKeys.map(key => key.toUpperCase());
      data = localProvider.getData.filter(item => normalizedFilterKeys.includes(item.key.toUpperCase()));
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
                 distinct="${this.distinct}"
                 conditional="${this.conditional}"
                 @zn-input="${this.handleInput}"
                 @zn-clear="${this.handleClear}"
                 @blur=${this.blur}
                 .value="${this.value}"
                 ?multiple=${this.multiple}
                 placeholder="${this.getPlaceholder(localProvider)}"
                 exportparts="combobox,expand-icon,form-control-help-text,form-control-input,display-input">
        ${(this.iconPosition !== 'none' || this.iconOnly) ? html`
          <div slot="prefix"
               class="select__icon ${this.iconPosition === 'end' ? 'select__icon--end' : ''}"></div>` : ''}
        ${data.map((item: DataProviderOption) => html`
          <zn-option class="select__option" value="${item.key}">
            ${(this.iconPosition !== 'none' || this.iconOnly) ? html`<span
              slot="prefix">${item.prefix}</span>` : ''}
            ${this.iconOnly ? undefined : item.value}
          </zn-option>`)}
      </zn-select>`;
  }

  private _updatePrefix() {
    if (!this.select || !this.shadowRoot) {
      return;
    }

    const selectIcon = this.shadowRoot.querySelector('.select__icon')!;
    const shouldShowIcon = this.iconPosition !== 'none' || this.iconOnly;
    if (!shouldShowIcon) {
      if (selectIcon) selectIcon.innerHTML = '';
      this._updateIconEmptyState();
      return;
    }

    if (this.iconPosition === 'none' && this.iconOnly) {
      this.iconPosition = 'start';
    }

    const selectedOptions = this.select.selectedOptions;
    if (!selectedOptions || selectedOptions.length === 0) {
      if (selectIcon) selectIcon.innerHTML = '';
      this._updateIconEmptyState();
      return;
    }

    if (!selectIcon) {
      return;
    }

    const selectedOption = selectedOptions[0];
    const slot = selectedOption.querySelector('[slot="prefix"]');

    if (slot) {
      selectIcon.innerHTML = '';
      selectIcon.appendChild(slot.cloneNode(true));
    } else {
      selectIcon.innerHTML = '';
    }

    this._updateIconEmptyState();
  }

  private _updateIconEmptyState() {
    if (!this.shadowRoot) return;

    const selectIcon = this.shadowRoot.querySelector('.select__icon');
    const isEmpty = !selectIcon || selectIcon.innerHTML.trim() === '';

    if (isEmpty) {
      this.setAttribute('icon-empty', '');
    } else {
      this.removeAttribute('icon-empty');
    }
  }

  private getPlaceholder(localProvider: LocalDataProvider<any>) {
    if (!this.value) {
      return `Choose a ${localProvider.getName}`;
    }

    const hasValue = Array.isArray(this.value) ? this.value.length > 0 : this.value.length > 0;
    if (hasValue) {
      return '';
    }

    return `Choose a ${localProvider.getName}`
  }
}
