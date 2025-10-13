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
import type {ZnInputEvent} from "../../events/zn-input";

import styles from './bulk-actions.scss';

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
  options?: {
    [key: string]: string;
  };
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
    this._formController.updateValidity();
  }

  render() {
    return html`
      <div class="${classMap({
        'bulk-actions': true
      })}">
        <zn-select class="add-rule" placeholder="Select Filter" @zn-change="${this._addRule}">
          ${this.actions.map((item: BulkActionItem) => html`
            <zn-option value="${item.id}">
              ${item.name.charAt(0).toUpperCase() + item.name.slice(1)}
            </zn-option>`)}
        </zn-select>
        <input id="main-input" name="${this.name}" value="${this.value}" hidden>
      </div>
    `;
  }

  private _handleChange() {
    const data: { key: string; value: string }[] = [];
    [...this._selectedRules].forEach(([, value]) => {
      data.push({
        key: value.id,
        value: value.value
      });
    });

    this.value = btoa(JSON.stringify(data));
  }

  private _addRule(event: Event | null, value: string = "", pos?: number) {
    const target = event?.target as ZnSelect;
    const id = value ? value : target?.value || '';
    if (id === '') return;

    const filter = this.actions.find(item => item.id === id);
    if (!filter) return;

    const uniqueId = Math.random().toString(36).substring(7);
    this._selectedRules.set(uniqueId, {
      id: filter.id,
      name: filter.name,
      value: ''
    });

    const keySelect = html`
      <zn-select class="query-builder__key"
                 @zn-change="${(e: ZnChangeEvent) => this._changeRule(uniqueId, e)}"
                 value="${filter.id}">
        ${this.actions.map((item: BulkActionItem) => html`
          <zn-option value="${item.id}">
            ${item.name.charAt(0).toUpperCase() + item.name.slice(1)}
          </zn-option>
        `)}
      </zn-select>
    `;

    const input = this._createInput(uniqueId, filter);

    const remove = html`
      <zn-button class="query-builder__remove"
                 icon="delete"
                 icon-size="24"
                 color="transparent"
                 size="square"
                 @click="${(e: Event) => this._removeRule(uniqueId, e)}">
      </zn-button>`;

    const wrapper = html`
      <div class="query-builder__wrapper">
        ${input}
        ${remove}
      </div>
    `;

    const rowElement = html`
      <div id="${uniqueId}" class="query-builder__row">
        ${keySelect}
        ${wrapper}
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
    if (this.addRule.selectedOptions?.length) {
      this.addRule.selectedOptions[0].selected = false;
    }

    this._handleChange();
  }

  private _createInput(uniqueId: string, filter: BulkActionItem): ZnSelect | ZnInput | null {
    if (filter.options) {
      const input = html`
        <zn-select class="query-builder__value"
                   @zn-change="${(e: ZnChangeEvent) => this._updateValue(uniqueId, e)}">
          ${Object.keys(filter.options).map(key => html`
            <zn-option value="${key}">
              ${filter.options ? filter.options[key] : ''}
            </zn-option>
          `)}
        </zn-select>`;
      const el = litToHTML<ZnSelect>(input);
      if (el) {
        // initialize with current selection
        this._updateValue(uniqueId, {target: el} as unknown as Event);
      }
      return el;
    }

    if (filter.type === 'bool' || filter.type === 'boolean') {
      const input = html`
        <zn-select class="query-builder__value"
                   @zn-change="${(e: ZnChangeEvent) => this._updateValue(uniqueId, e)}">
          <zn-option value="1">True</zn-option>
          <zn-option value="0">False</zn-option>
        </zn-select>`;
      return litToHTML<ZnSelect>(input);
    }

    if (filter.type === 'number') {
      const input = html`
        <zn-input type="number"
                  class="query-builder__value"
                  @zn-input="${(e: ZnInputEvent) => this._updateValue(uniqueId, e)}">
        </zn-input>`;
      return litToHTML<ZnInput>(input);
    }

    if (filter.type === 'date') {
      const input = html`
        <zn-input type="date"
                  class="query-builder__value"
                  @zn-input="${(e: ZnInputEvent) => this._updateValue(uniqueId, e)}">
        </zn-input>`;
      return litToHTML<ZnInput>(input);
    }

    const input = html`
      <zn-input type="text"
                class="query-builder__value"
                @zn-input="${(e: ZnInputEvent) => this._updateValue(uniqueId, e)}">
      </zn-input>`;
    return litToHTML<ZnInput>(input);
  }

  private _updateValue(id: string, event: Event | { target: ZnSelect | ZnInput | HTMLDivElement }) {
    const filter = this._selectedRules.get(id);
    if (!filter) return;

    const input = event.target as ZnSelect | ZnInput;
    filter.value = input.value as string;

    this._selectedRules.set(id, filter);
    this._handleChange();
  }

  private _getRulePosition(id: string): number {
    const rules = this.container.querySelectorAll('.query-builder__row');
    let position: number = -1;
    rules.forEach((item, index) => {
      if ((item as HTMLDivElement).id === id) {
        position = index;
      }
    });
    return position;
  }

  private _changeRule(id: string, event: ZnChangeEvent) {
    // remove the element from the dom
    const pos: number = this._getRulePosition(id);
    const select = event.target as ZnSelect;
    select.popup.active = false;
    select?.parentElement?.remove();
    // recreate the element based on the selected value;
    this._removeRule(id, event as unknown as Event);
    this._addRule(event as unknown as Event, '', pos);
  }

  private _removeRule(id: string, event: Event) {
    this._selectedRules.delete(id);
    const button = event.target as ZnButton;
    button?.closest('.query-builder__row')?.remove();
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
