import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {FormControlController, validValidityState} from "../../internal/form";
import {property} from 'lit/decorators.js';
import ZincElement, {type ZincFormControl} from '../../internal/zinc-element';
import ZnInput from "../input";
import type ZnDataSelect from "../data-select";
import type ZnQueryBuilder from "../query-builder";
import type ZnSelect from "../select";

import styles from './data-table-search.scss';

type AllowedInputElement =
  HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement
  | ZnInput
  | ZnSelect
  | ZnDataSelect
  | ZnQueryBuilder

/**
 * @summary A search component for data tables.
 * @documentation https://zinc.style/components/data-table-search
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-input
 *
 * @event zn-search-change - Emitted when the search value changes (debounced).
 *
 * @slot - The default slot for additional form inputs.
 *
 * @csspart base - The component's base wrapper.
 *
 * @property {string} name - The name of the search input field (default: "search").
 * @property {string} value - The current search value.
 * @property {string} placeholder - The placeholder text for the search input (default: "Search...").
 * @property {string} helpText - Help text displayed below the search input.
 * @property {string} searchUri - Optional URI to use for search operations.
 * @property {number} debounceDelay - The delay in milliseconds before triggering a search (default: 500).
 */
export default class ZnDataTableSearch extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-input': ZnInput,
  };

  private _formController: FormControlController = new FormControlController(this, {});
  private _searchTimeout?: number;

  @property() name: string = "search";

  @property() value: string = "";

  @property() placeholder: string = "Search...";

  @property({attribute: 'help-text'}) helpText: string = "";

  @property({attribute: 'search-uri'}) searchUri: string | undefined;

  @property({type: Number, attribute: 'debounce-delay'}) debounceDelay: number = 350;

  get validationMessage(): string {
    return '';
  }

  get validity(): ValidityState {
    return validValidityState;
  }

  checkValidity(): boolean {
    return true;
  }

  getForm(): HTMLFormElement | null {
    return this._formController.getForm();
  }

  reportValidity(): boolean {
    return true;
  }

  setCustomValidity(): void {
    this._formController.updateValidity();
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    this._formController.updateValidity();
  }

  /**
   * Collects form data from slotted input elements
   */
  getFormData(): Record<string, any> {
    const params: Record<string, any> = {};
    const slot = this.shadowRoot?.querySelector('slot');
    if (!slot) return params;

    const elements = slot.assignedElements({flatten: true});
    const allowedInputs = ['zn-input', 'zn-select', 'zn-query-builder', 'zn-multiselect', 'zn-params-select', 'zn-datepicker', 'input', 'select', 'textarea'];

    elements.forEach((element) => {
      if (allowedInputs.includes(element.tagName.toLowerCase())) {
        const input = element as AllowedInputElement;
        const value = input.value as string || element.getAttribute('value');
        const name = input.name || element.getAttribute('name');
        if (name) {
          params[name] = value;
        }
      }
    });

    return params;
  }

  handleInput = (e: Event) => {
    const input = e.target as ZnInput;
    this.value = input.value as string;
    this._formController.updateValidity();

    if (this._searchTimeout) {
      window.clearTimeout(this._searchTimeout);
    }

    this._searchTimeout = window.setTimeout(() => {
      this.emitSearchChange();
    }, this.debounceDelay);
  }

  handleClear = () => {
    if (this._searchTimeout) {
      window.clearTimeout(this._searchTimeout);
    }

    this.value = "";
    const input = this.shadowRoot?.querySelector('zn-input');
    if (input) {
      input.value = "";
    }
    this._formController.updateValidity();
    this.emitSearchChange();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._searchTimeout) {
      window.clearTimeout(this._searchTimeout);
    }
  }

  /**
   * Emit the search change event with form data
   */
  private emitSearchChange() {
    const formData = this.getFormData();
    this.emit('zn-search-change', {
      detail: {
        value: this.value,
        formData: formData,
        searchUri: this.searchUri
      }
    });
  }

  render() {
    return html`
      <div class="data-table-search">
        <zn-input
          type="search"
          name="${this.name}"
          placeholder="${this.placeholder}"
          help-text="${this.helpText}"
          value="${this.value}"
          clearable
          @zn-input="${this.handleInput}"
          @zn-clear="${this.handleClear}">
          <zn-icon slot="prefix" src="search" size="20"></zn-icon>
        </zn-input>
        <slot style="display: none"></slot>
      </div>
    `;
  }
}
