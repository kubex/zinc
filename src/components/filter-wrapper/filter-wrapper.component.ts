import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property} from "lit/decorators.js";
import ZincElement from '../../internal/zinc-element';

import type ZnDataSelect from "../data-select";
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

  private hasSubmitButton: boolean = false;

  handleSubmit = (event: Event) => {
    event.preventDefault();
    const dataTable: ZnDataTable | null = this.closest('zn-data-table');
    if (dataTable) {
      const allowedInputs = ['zn-input', 'zn-select', 'zn-query-builder', 'zn-data-select', 'input', 'select', 'textarea'];
      const inputs = Array.from(this.querySelectorAll(allowedInputs.join(','))) as AllowedInputElement[];
      const params: Record<string, any> = {};
      inputs.forEach(input => {
        if (!input.value && input.hasAttribute('omit-empty')) {
          return;
        }
        params[input.name] = input.value as string;
      });

      dataTable.requestParams = params;
      dataTable.refresh();
    }
  }

  connectedCallback() {
    super.connectedCallback();
    const button: HTMLElement | null = this.querySelector('zn-button[submit]');
    if (button) {
      this.hasSubmitButton = true;
      button.addEventListener('click', this.handleSubmit);
    }
  }

  private renderDefaultButton() {
    return html`
      <zn-button part="search-button"
                 class="filter-wrapper__submit"
                 type="submit"
                 @click="${this.handleSubmit}">
        ${this.button}
      </zn-button>
    `;
  }

  render() {
    return html`
      <slot></slot>
      ${this.hasSubmitButton ? '' : this.renderDefaultButton()}
    `;
  }
}
