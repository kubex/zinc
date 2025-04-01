import {
  colorDataProvider,
  countryDataProvider,
  currencyDataProvider,
  type DataProviderOption,
  emptyDataProvider,
  type LocalDataProvider
} from "./providers/provider";
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {FormControlController} from "../../internal/form";
import {LocalizeController} from '../../utilities/localize';
import {property, query} from 'lit/decorators.js';
import {watch} from "../../internal/watch";
import type {ZincFormControl} from '../../internal/zinc-element';
import ZincElement from '../../internal/zinc-element';

import styles from './data-select.scss';
import {ifDefined} from "lit/directives/if-defined.js";

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

  // @ts-expect-error unused property
  private readonly localize = new LocalizeController(this);
  protected readonly formControlController = new FormControlController(this);

  @query('#select') select: HTMLSelectElement;
  @query('#select__prefix') selectPrefix: HTMLElement;

  /** The name of the select. Used for form submission. */
  @property() name: string;

  /** The value of the select. Used for form submission. */
  @property() value: string;

  /** The provider of the select. */
  @property() provider: 'color' | 'currency' | 'country';

  /** Should we hide the prefix of the options, and the select. */
  @property({attribute: 'hide-prefix', type: Boolean}) hidePrefix: boolean;

  /** Should we show the clear button. */
  @property({type: Boolean}) clearable: boolean;

  /** An array of keys to use for filtering the options in the selected provider. */
  @property({
    attribute: 'filter',
    converter: {
      fromAttribute: (value: string) => value.split(','),
      toAttribute: (value: string[]) => value.join(',')
    }
  }) filter: string[];


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

  @watch('value', {waitUntilFirstUpdate: true})
  async handleValueChange() {
    await this.updateComplete;
    this.formControlController.updateValidity();

    // Set the prefix of the select to the selected values prefix
    const selectedOption = this.select.selectedOptions[0];
    if (selectedOption && !this.hidePrefix) {
      const prefix = selectedOption.querySelector('[slot="prefix"]');

      if (prefix) {
        this.selectPrefix.innerHTML = '';
        this.selectPrefix.appendChild(prefix.cloneNode(true));
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
      default:
        return emptyDataProvider;
    }
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
                 name="${this.name}"
                 @zn-input="${this.handleInput}"
                 @zn-clear="${this.handleClear}"
                 value="${this.value}"
                 placeholder="Choose a ${localProvider.getName}">
        <div id="select__prefix" slot="prefix" class="select__prefix"></div>
        ${data.map((item: DataProviderOption) => html`
          <zn-option class="select__option" value="${item.key}">
            ${this.hidePrefix ? '' : html`<span slot="prefix">${item.prefix}</span>`}
            ${item.value}
          </zn-option>`)}
      </zn-select>
    `;
  }
}
