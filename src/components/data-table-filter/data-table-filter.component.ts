import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {FormControlController, validValidityState} from "../../internal/form";
import {property} from 'lit/decorators.js';
import ZincElement, {type ZincFormControl} from '../../internal/zinc-element';
import ZnQueryBuilder from "../query-builder";
import type {ZnChangeEvent} from "../../events/zn-change";

import styles from './data-table-filter.scss';


/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/data-table-filter
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
export default class ZnDataTableFilter extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);

  private _formController: FormControlController = new FormControlController(this, {});

  @property() filters = "";

  @property() name: string = "data-table-filter";

  @property() value: PropertyKey;

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

  setCustomValidity(_: string): void {
    this._formController.updateValidity();
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    this._formController.updateValidity();
  }

  handleQBChange = (event: ZnChangeEvent) => {
    const target = event.target as ZnQueryBuilder;
    this.value = target.value;
    this._formController.updateValidity();
    this.emit('zn-change');
  }

  handleQBClear = () => {
    const builder = this.shadowRoot?.querySelector('zn-query-builder');
    if (!builder) {
      return;
    }

    builder.clear();
  }

  handleQBReset = () => {
    const builder = this.shadowRoot?.querySelector('zn-query-builder');
    if (!builder) {
      return;
    }

    builder.reset();
  }

  handleQBUpdate = () => {
    const builder = this.shadowRoot?.querySelector('zn-query-builder');
    if (!builder) {
      return;
    }

    this.value = builder.value;

    this.closeSlideout();
    this._formController.updateValidity();
    this.emit('zn-change');
  }

  closeSlideout() {
    const slideout = this.shadowRoot?.querySelector('zn-slideout');
    if (slideout) {
      slideout.hide();
    }
  }

  render() {
    return html`
      <zn-button id="slideout-trigger" color="transparent" size="content" icon="filter_alt" icon-size="22"
                 slot="trigger"
                 tooltip="Open Filter"></zn-button>
      <zn-slideout class="slideout-basic" trigger="slideout-trigger" label="Filters">

        <div class="data-table-filter">
          <zn-query-builder filters="${this.filters}" @zn-change=${this.handleQBChange}></zn-query-builder>
        </div>

        <zn-button color="secondary" slot="footer" slideout-closer @click=${this.handleQBReset}>Cancel
        </zn-button>
        <div slot="footer">
          <zn-button color="transparent" size="x-small" slot="footer" @click=${this.handleQBClear}>Clear
          </zn-button>
          <zn-button color="default" slot="footer" @click=${this.handleQBUpdate}>Show Results</zn-button>
        </div>
      </zn-slideout>
    `;
  }
}
