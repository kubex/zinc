import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {FormControlController} from "../../internal/form";
import {litToHTML} from "../../utilities/lit-to-html";
import {property, query} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import ZnButton from "../button";
import ZnInput from "../input";
import ZnOption from "../option";
import ZnSelect from "../select";
import type {ZnChangeEvent} from "../../events/zn-change";

import styles from './bulk-actions.scss';
import type {ZnInputEvent} from "../../events/zn-input";

export interface CreatedRule {
  id: string;
  name: string;
  value: string;
}

export type BulkActionData = BulkActionItem[];

export interface BulkActionItem {
  id: string;
  name: string;
  type?: 'bool' | 'boolean' | 'date' | 'number';
  options?: BulkActionOptions;
}

export interface BulkActionOptions {
  [key: string | number]: string | number;
}

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/bulk-actions
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-button
 * @dependency zn-input
 * @dependency zn-option
 * @dependency zn-select
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
export default class ZnBulkActions extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-button': ZnButton,
    'zn-input': ZnInput,
    'zn-option': ZnOption,
    'zn-select': ZnSelect,
  };

  @query('.bulk-actions') container: HTMLDivElement;
  @query('.add-rule') addRule: ZnSelect;
  @query('input#main-input') input: HTMLInputElement;

  @property() name: string;
  @property() value: PropertyKey;
  @property({type: Array}) actions: BulkActionData = [];

  private _selectedRules: Map<string, CreatedRule> = new Map<string, CreatedRule>();
  private _formController: FormControlController = new FormControlController(this, {});


  get validationMessage(): string {
    return '';
  }

  get validity(): ValidityState {
    return this.input?.validity;
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    this._handleChange();
    this._formController.updateValidity();
  }

  render() {
    return html`
      <div class="${classMap({
        'bulk-actions': true
      })}">
        <zn-select class="add-rule"
                   size="medium"
                   placeholder="Select Action"
                   @zn-change="${this._addRule}">
          ${this.actions.map(item => html`
            <zn-option value="${item.id}">
              ${item.name.charAt(0).toUpperCase() + item.name.slice(1)}
            </zn-option>`)}
        </zn-select>
        <input id="main-input" name="${this.name}" value="${this.value}" hidden>
      </div>
    `;
  }

  private _handleChange() {
    const data: object[] = [];
    [...this._selectedRules].forEach(([, value]) => {
      data.push({
        key: value.id,
        value: value.value
      });
    });

    this.value = btoa(JSON.stringify(data));
  }

  private _addRule(event: Event | null, value: string = '', pos?: number) {
    const target = event?.target as ZnSelect;
    const id = value ? value : target.value;
    if (id === '') return;

    const filter: BulkActionItem | undefined = this.actions.find(item => item.id === id);
    if (filter === undefined) return;

    const uniqueId = Math.random().toString(36).substring(7);
    this._selectedRules.set(uniqueId, {
      id: filter.id,
      name: filter.name,
      value: ''
    });

    const select = html`
      <zn-select class="bulk-action__key"
                 @zn-change="${(e: ZnChangeEvent) => this._changeRule(uniqueId, e)}"
                 value="${filter?.id}">
        ${this.actions.map((item: BulkActionItem) => {
          return html`
            <zn-option value="${item.id}">
              ${item.name.charAt(0).toUpperCase() + item.name.slice(1)}
            </zn-option>
          `;
        })}
      </zn-select>
    `;

    const remove = html`
      <zn-button class="bulk-action__remove"
                 icon="delete"
                 icon-size="24"
                 color="transparent"
                 size="square"
                 @click="${(e: Event) => this._removeRule(uniqueId, e)}">
      </zn-button>`;

    const rowElement = html`
      <div id="${uniqueId}" class="bulk-action__row">
        ${select}
        ${this._createInput(filter, uniqueId)}
        ${remove}
      </div>
    `;

    const row = litToHTML<HTMLDivElement>(rowElement);
    if (!row) return;

    if (pos !== undefined) {
      this.container.insertBefore(row, this.container.children[pos]);
    } else {
      this.container.insertBefore(row, this.addRule);
    }

    // Reset back to default placeholder
    this.addRule.value = '';
    this.addRule.displayLabel = '';
    this.addRule.selectedOptions[0].selected = false;

    // Auto scroll to keep the add rule select in view
    if (target === this.addRule && this.parentElement) {
      const parentElement = this.parentElement;
      requestAnimationFrame(() => {
        parentElement.scrollTop = parentElement.scrollHeight;
      });
    }

    this._handleChange();
  }

  private _createInput(filter: BulkActionItem, uniqueId: string) {
    let input: ZnSelect | ZnInput | null;
    switch (filter.type) {
      case 'bool':
      case 'boolean': {
        input = this._createBooleanInput(uniqueId);
        break;
      }
      case 'number': {
        input = this._createNumberInput(uniqueId);
        break;
      }
      case 'date': {
        input = this._createDateInput(uniqueId);
        break;
      }
      default: {
        input = filter.options ? this._createSelectInput(uniqueId, filter) : this._createDefaultInput(uniqueId);
        break;
      }
    }
    return input;
  }

  private _createBooleanInput(uniqueId: string): ZnSelect | null {
    const input = html`
      <zn-select class="bulk-action__value"
                 @zn-change="${(e: ZnChangeEvent) => this._updateValue(uniqueId, e)}">
        <zn-option value="1">True</zn-option>
        <zn-option value="0">False</zn-option>
      </zn-select>`;
    return litToHTML<ZnSelect>(input);
  }

  private _createNumberInput(uniqueId: string): ZnInput | null {
    const input = html`
      <zn-input type="number"
                class="bulk-action__value"
                @zn-input="${(e: ZnInputEvent) => this._updateValue(uniqueId, e)}">
      </zn-input>`;
    return litToHTML<ZnInput>(input);
  }

  private _createDateInput(uniqueId: string): ZnInput | null {
    const input = html`
      <zn-input type="date"
                class="bulk-action__value"
                @zn-input="${(e: ZnInputEvent) => this._updateDateValue(uniqueId, e)}">
      </zn-input>`;
    return litToHTML<ZnInput>(input);
  }

  private _createSelectInput(uniqueId: string, filter: BulkActionItem): ZnSelect | null {
    const options: BulkActionOptions | undefined = this.actions.find(item => item.id === filter?.id)?.options;
    if (options === undefined) return null;

    const input = html`
      <zn-select class="bulk-action__value"
                 @zn-change="${(e: ZnChangeEvent) => this.updateInValue(uniqueId, e)}">
        ${Object.keys(options).map(key => html`
          <zn-option value="${key}">
            ${options[key]}
          </zn-option>`)}
      </zn-select>`;
    return litToHTML<ZnSelect>(input);
  }

  private _createDefaultInput(uniqueId: string): ZnInput | null {
    const input = html`
      <zn-input type="text"
                class="bulk-action__value"
                @zn-input="${(e: ZnInputEvent) => this._updateValue(uniqueId, e)}">
      </zn-input>`;
    return litToHTML<ZnInput>(input);
  }

  private _updateDateValue(id: string, event: Event | { target: ZnSelect | ZnInput | HTMLDivElement }) {
    const filter = this._selectedRules.get(id);
    if (!filter) return;
    const input = event.target as ZnSelect | ZnInput;
    // Dodgy logic to offset backend filter comparator values
    // Ref: backend/src/Infrastructure/Helpers/AdvancedFilterHelper.php:106
    const timestamp = (Math.floor(Date.now() - Date.parse(input.value as string)) / 1000 / 60).toString();

    filter.value = timestamp as string;

    this._selectedRules.set(id, filter);
    this._handleChange();
  }

  private _updateValue(id: string, event: Event | { target: ZnSelect | ZnInput | HTMLDivElement }) {
    const filter = this._selectedRules.get(id);
    if (!filter) return;

    const input = event.target as ZnSelect | ZnInput;
    filter.value = input.value as string;

    this._selectedRules.set(id, filter);
    this._handleChange();
  }

  private updateInValue(id: string, event: Event) {
    const filter = this._selectedRules.get(id);
    if (!filter) return;

    const input = event.target as ZnSelect;
    filter.value = input.value as string;

    this._selectedRules.set(id, filter);
    this._handleChange();
  }

  private _changeRule(id: string, event: ZnChangeEvent) {
    // remove the element from the dom
    const pos: number = this._getRulePosition(id);
    const select = event.target as ZnSelect;
    select.popup.active = false;
    select?.parentElement?.remove();
    // recreate the element based on the selected value;
    this._removeRule(id, event);
    this._addRule(event, '', pos);
  }

  private _getRulePosition(id: string): number {
    const rules = this.container.querySelectorAll('.bulk-action__row');
    let position: number = -1;
    rules.forEach((item, index) => {
      if (item.id === id) {
        position = index;
      }
    });
    return position;
  }

  private _removeRule(id: string, event: Event) {
    this._selectedRules.delete(id);
    const button = event.target as ZnButton;
    button?.closest('.bulk-action__row')?.remove();
    this._handleChange();
  }

  checkValidity(): boolean {
    return this.input.checkValidity();
  }

  getForm(): HTMLFormElement | null {
    return this._formController.getForm();
  }

  reportValidity(): boolean {
    return this.input.reportValidity();
  }

  setCustomValidity(message: string): void {
    this.input.setCustomValidity(message);
    this._formController.updateValidity();
  }
}
