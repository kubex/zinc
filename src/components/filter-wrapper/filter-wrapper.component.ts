import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property, state} from "lit/decorators.js";
import {trimControlValue} from '../../internal/form';
import ZincElement from '../../internal/zinc-element';

import type ZnDataSelect from "../data-select";
import type ZnButton from "../button";
import type ZnDataTable from "../data-table";
import type ZnInput from "../input";
import type ZnQueryBuilder from "../query-builder";
import type ZnSelect from "../select";

import styles from './filter-wrapper.scss';

type AllowedInputElement =
  HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement
  | ZnInput
  | ZnSelect
  | ZnDataSelect
  | ZnQueryBuilder

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/filter-wrapper
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
export default class ZnFilterWrapper extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property() button: string = 'Filter';

  /** Submits the filters when Enter is pressed in a text field. */
  @property({attribute: 'submit-on-enter', type: Boolean}) submitOnEnter = false;

  /** Shown on the submit button while results load. */
  @property({attribute: 'loading-text'}) loadingText = 'Searching...';

  @state() private loading = false;

  private submitButton: ZnButton | null = null;

  handleSubmit = (event: Event) => {
    event.preventDefault();
    const dataTable: ZnDataTable | null = this.closest('zn-data-table');
    if (dataTable && !this.loading) {
      const allowedInputs = ['zn-input', 'zn-select', 'zn-query-builder', 'zn-data-select', 'zn-datepicker', 'input', 'select', 'textarea'];
      const inputs = Array.from(this.querySelectorAll(allowedInputs.join(','))) as AllowedInputElement[];
      const params: Record<string, any> = {};
      inputs.forEach(input => {
        trimControlValue(input);
        if (!input.value && input.hasAttribute('omit-empty')) {
          return;
        }
        params[input.name] = input.value as string;
      });

      dataTable.requestParams = params;
      this.setLoading(true);
      Promise.resolve(dataTable.refresh()).finally(() => this.setLoading(false));
    }
  }

  private setLoading(loading: boolean) {
    this.loading = loading;
    if (this.submitButton) {
      this.submitButton.processingText = this.loadingText;
      this.submitButton.processing = loading;
    }
  }

  handleKeyDown = (event: KeyboardEvent) => {
    if (!this.submitOnEnter || event.key !== 'Enter' || event.defaultPrevented || event.isComposing
      || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }

    // Only plain text fields: selects, buttons and textareas use Enter themselves
    if (event.composedPath()[0] instanceof HTMLInputElement) {
      this.handleSubmit(event);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this.handleKeyDown);
    this.submitButton = this.querySelector('zn-button[submit]');
    this.submitButton?.addEventListener('click', this.handleSubmit);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.handleKeyDown);
  }

  private renderDefaultButton() {
    return html`
      <zn-button part="search-button"
                 class="filter-wrapper__submit"
                 type="submit"
                 ?processing="${this.loading}"
                 processing-text="${this.loadingText}"
                 @click="${this.handleSubmit}">
        ${this.button}
      </zn-button>
    `;
  }

  render() {
    return html`
      <slot></slot>
      ${this.submitButton ? '' : this.renderDefaultButton()}
    `;
  }
}
