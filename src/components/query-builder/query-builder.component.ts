import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, nothing, type PropertyValues, unsafeCSS} from 'lit';
import {FormControlController} from "../../internal/form";
import {litToHTML} from "../../utilities/lit-to-html";
import {property, query} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import ZnButton from "../button";
import ZnInput from "../input";
import ZnOption from "../option";
import ZnSelect from "../select";
import type {ZincFormControl} from '../../internal/zinc-element';
import type {ZnChangeEvent} from "../../events/zn-change";
import type {ZnInputEvent} from "../../events/zn-input";

import styles from './query-builder.scss';

export type QueryBuilderData = QueryBuilderItem[];

export interface QueryBuilderItem {
  id: string;
  name: string;
  type?: QueryBuilderType;
  options?: QueryBuilderOptions;
  operators: QueryBuilderOperators[];
  maxOptionsVisible?: string;
}

export type QueryBuilderType = 'bool' | 'boolean' | 'date' | 'number';

export interface QueryBuilderOptions {
  [key: string | number]: string | number;
}

export enum QueryBuilderOperators {
  Eq = 'eq',
  Neq = 'neq',
  Eqi = 'eqi',
  Neqi = 'neqi',
  Before = 'before',
  After = 'after',
  In = 'in',
  Nin = 'nin',
  MatchPhrasePre = 'matchphrasepre',
  NMatchPhrasePre = 'nmatchphrasepre',
  MatchPhrase = 'matchphrase',
  NMatchPhrase = 'nmatchphrase',
  Match = 'match',
  NMatch = 'nmatch',
  Starts = 'starts',
  NStarts = 'nstarts',
  Ends = 'ends',
  NEnds = 'nends',
  Wild = 'wild',
  NWild = 'nwild',
  Like = 'like',
  NLike = 'nlike',
  Fuzzy = 'fuzzy',
  NFuzzy = 'nfuzzy',
  Gte = 'gte',
  Gt = 'gt',
  Lt = 'lt',
  Lte = 'lte'
}

const operatorText: { [key in QueryBuilderOperators]: string } = {
  [QueryBuilderOperators.Eq]: 'Equals',
  [QueryBuilderOperators.Neq]: 'Not Equals',
  [QueryBuilderOperators.Eqi]: 'Equals (Insensitive)',
  [QueryBuilderOperators.Neqi]: 'Not Equals (Insensitive)',
  [QueryBuilderOperators.Before]: 'Was Before',
  [QueryBuilderOperators.After]: 'Was After',
  [QueryBuilderOperators.In]: 'In',
  [QueryBuilderOperators.Nin]: 'Not In',
  [QueryBuilderOperators.MatchPhrasePre]: 'Match Phrase Prefix',
  [QueryBuilderOperators.NMatchPhrasePre]: 'Does Not Match Phrase Prefix',
  [QueryBuilderOperators.MatchPhrase]: 'Match Phrase',
  [QueryBuilderOperators.NMatchPhrase]: 'Does Not Match Phrase',
  [QueryBuilderOperators.Match]: 'Match',
  [QueryBuilderOperators.NMatch]: 'Does Not Match',
  [QueryBuilderOperators.Starts]: 'Starts With',
  [QueryBuilderOperators.NStarts]: 'Does Not Start With',
  [QueryBuilderOperators.Ends]: 'Ends With',
  [QueryBuilderOperators.NEnds]: 'Does Not End With',
  [QueryBuilderOperators.Wild]: 'Wildcard Match',
  [QueryBuilderOperators.NWild]: 'Does Not Match Wildcard',
  [QueryBuilderOperators.Like]: 'Like Match With',
  [QueryBuilderOperators.NLike]: 'Does Not Like Match With',
  [QueryBuilderOperators.Fuzzy]: 'Fuzzy Match With',
  [QueryBuilderOperators.NFuzzy]: 'Does Not Match Fuzzy With',
  [QueryBuilderOperators.Gte]: 'Greater Than or Equals',
  [QueryBuilderOperators.Gt]: 'Greater Than',
  [QueryBuilderOperators.Lt]: 'Less Than',
  [QueryBuilderOperators.Lte]: 'Less Than or Equals',
};

export interface CreatedRule {
  id: string;
  name: string;
  operator: string;
  value: string;
}

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/query-builder
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-button
 * @dependency zn-input
 * @dependency zn-option
 * @dependency zn-select
 *
 * @slot - The default slot.
 * @slot example - An example slot.
 *
 * @csspart base - The component's base wrapper.
 *
 * @cssproperty --example - An example CSS custom property.
 */
export default class ZnQueryBuilder extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-button': ZnButton,
    'zn-input': ZnInput,
    'zn-option': ZnOption,
    'zn-select': ZnSelect,
  };

  private _selectedRules: Map<string, CreatedRule> = new Map<string, CreatedRule>();
  private _formController: FormControlController = new FormControlController(this, {});
  private _previousOperator: QueryBuilderOperators;

  @query('.query-builder') container: HTMLDivElement;
  @query('.add-rule') addRule: ZnSelect;
  @query('input#main-input') input: HTMLInputElement;

  @property({type: Array}) filters: QueryBuilderData = [];
  @property({type: Boolean}) dropdown: boolean = false;
  @property() name: string;
  @property() value: PropertyKey;
  @property({
    attribute: 'show-values',
    converter: {
      fromAttribute: (value: string) => value.split(' '),
      toAttribute: (value: string[]) => value.join(' ')
    }
  }) showValues: string[] = [];


  get validationMessage(): string {
    return '';
  }

  get validity(): ValidityState {
    return this.input.validity;
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    if (this.showValues) {
      this.showValues.forEach(item => {
        this._addRule(null, item);
      });
    }
    this._handleChange();
    this._formController.updateValidity();
  }

  render() {
    return html`
      <div class=${classMap({
        "query-builder": true,
        "query-builder--dropdown": this.dropdown,
      })}>
        <zn-select class="add-rule"
                   size="medium"
                   placeholder="Select Filter"
                   @zn-change="${this._addRule}">
          ${this.filters.map(item => html`
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
        comparator: value.operator,
        value: value.value
      });
    });

    this.value = btoa(JSON.stringify(data));
  }

  private _addRule(event: Event | null, value: string, pos?: number) {
    const target = event?.target as ZnSelect;
    const id = value ? value : target.value;
    if (id === '') return;

    const filter: QueryBuilderItem | undefined = this.filters.find(item => item.id === id);
    if (filter === undefined) return;

    const uniqueId = Math.random().toString(36).substring(7);
    this._selectedRules.set(uniqueId, {
      id: filter.id,
      name: filter.name,
      operator: filter.operators.length > 0 ? filter.operators[0] : QueryBuilderOperators.Eq,
      value: ''
    });

    const select = html`
      <zn-select class="query-builder__key"
                 @zn-change="${(e: ZnChangeEvent) => this._changeRule(uniqueId, e)}"
                 value="${filter?.id}">
        ${this.filters.map((item: QueryBuilderItem) => {
          return html`
            <zn-option value="${item.id}">
              ${item.name.charAt(0).toUpperCase() + item.name.slice(1)}
            </zn-option>
          `;
        })}
      </zn-select>
    `;

    const comparator = html`
      <zn-select class="query-builder__comparator"
                 @zn-change="${(e: ZnChangeEvent) => {
                   this._updateOperatorValue(uniqueId, e)
                   this._changeValueInput(uniqueId, e, filter);
                 }}"
                 value="${filter.operators[0]}"
                 ?disabled="${filter.operators.length === 1}">
        ${filter.operators.map((item: QueryBuilderOperators) => {
          return html`
            <zn-option value="${item}">${operatorText[item as QueryBuilderOperators]}</zn-option>`;
        })}
      </zn-select>`;

    const remove = html`
      <zn-button class="query-builder__remove"
                 icon="delete"
                 icon-size="24"
                 color="transparent"
                 size="square"
                 @click="${(e: Event) => this._removeRule(uniqueId, e)}">
      </zn-button>`;

    const selectedComparator = filter.operators.length > 0 ? filter.operators[0] : QueryBuilderOperators.Eq;
    const wrapper = html`
      <div class="query-builder__wrapper">
        ${this._createInput(filter, uniqueId, selectedComparator)}
        ${remove}
      </div>
    `;

    const rowElement = html`
      <div id="${uniqueId}" class="query-builder__row">
        ${select}
        ${comparator}
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
    this.addRule.selectedOptions[0].selected = false;

    // Auto scroll to keep the add rule select in view
    if (target === this.addRule && this.parentElement?.classList.contains('dropdown__query-builder')) {
      const parentElement = this.parentElement;
      requestAnimationFrame(() => {
        parentElement.scrollTop = parentElement.scrollHeight;
      });
    }

    this._handleChange();
  }

  private _createInput(filter: QueryBuilderItem, uniqueId: string, selectedComparator: QueryBuilderOperators) {
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
        input = filter.options ? this._createSelectInput(uniqueId, filter, selectedComparator) : this._createDefaultInput(uniqueId);
        break;
      }
    }
    return input;
  }

  private _changeValueInput(uniqueId: string, changeEvent: ZnChangeEvent, filter: QueryBuilderItem) {
    // Only comparisons with options need to change input
    if (!filter.options) return;

    const compareSelect = changeEvent.target as ZnSelect;

    // Comparison the same - no change
    if (compareSelect.value === this._previousOperator) return;

    const input: ZnInput | null | undefined = compareSelect.parentElement?.querySelector('.query-builder__value');

    // Cannot find input
    if (!input) return;

    const parent = input?.parentElement as HTMLDivElement;

    parent.removeChild(input);

    const newInput = this._createInput(filter, uniqueId, compareSelect.value as QueryBuilderOperators);

    if (!newInput) return;

    parent.prepend(newInput);
  }

  private _createBooleanInput(uniqueId: string): ZnSelect | null {
    const input = html`
      <zn-select class="query-builder__value"
                 @zn-change="${(e: ZnChangeEvent) => this._updateValue(uniqueId, e)}">
        <zn-option value="1">True</zn-option>
        <zn-option value="0">False</zn-option>
      </zn-select>`;
    return litToHTML<ZnSelect>(input);
  }

  private _createNumberInput(uniqueId: string): ZnInput | null {
    const input = html`
      <zn-input type="number"
                class="query-builder__value"
                @zn-input="${(e: ZnInputEvent) => this._updateValue(uniqueId, e)}">
      </zn-input>`;
    return litToHTML<ZnInput>(input);
  }

  private _createDateInput(uniqueId: string): ZnInput | null {
    const input = html`
      <zn-input type="date"
                class="query-builder__value"
                @zn-input="${(e: ZnInputEvent) => this._updateDateValue(uniqueId, e)}">
      </zn-input>`;
    return litToHTML<ZnInput>(input);
  }

  private _createSelectInput(uniqueId: string, filter: QueryBuilderItem, selectedComparator: QueryBuilderOperators): ZnSelect | null {
    const options: QueryBuilderOptions | undefined = this.filters.find(item => item.id === filter?.id)?.options;

    if (options === undefined) return null;

    const multiSelect = selectedComparator === QueryBuilderOperators.In || selectedComparator === QueryBuilderOperators.Nin;
    const input = html`
      <zn-select class="query-builder__value"
                 @zn-change="${(e: ZnChangeEvent) => this.updateInValue(uniqueId, e)}"
                 name=${(multiSelect ? 'value' : undefined) || nothing}
                 multiple=${multiSelect || nothing}
                 clearable=${multiSelect || nothing}
                 max-options-visible=${filter.maxOptionsVisible || nothing}
                 selectedItems=${(multiSelect ? JSON.stringify(options) : undefined) || nothing}>
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
                class="query-builder__value"
                @zn-input="${(e: ZnInputEvent) => this._updateValue(uniqueId, e)}">
      </zn-input>`;
    return litToHTML<ZnInput>(input);
  }

  private _updateOperatorValue(id: string, event: ZnChangeEvent) {
    const filter = this._selectedRules.get(id);
    if (!filter) return;


    const select = event.target as ZnSelect;
    this._previousOperator = filter.operator as QueryBuilderOperators;
    filter.operator = select.value as QueryBuilderOperators;

    this._selectedRules.set(id, filter);
    this._handleChange();
  }

  private _updateDateValue(id: string, event: Event | { target: ZnSelect | ZnInput | HTMLDivElement }) {
    const filter = this._selectedRules.get(id);
    if (!filter) return;
    const input = event.target as ZnSelect | ZnInput;
    // Dodgy logic to offset backend filter comparator values
    // Ref: backend/src/Infrastructure/Helpers/AdvancedFilterHelper.php:106
    const multiplier = filter.operator as QueryBuilderOperators === QueryBuilderOperators.Before ? -1 : 1;
    const timestamp = (Math.floor((Date.now() - Date.parse(input.value as string)) / 1000 / 60) * multiplier).toString();

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
    const rules = this.container.querySelectorAll('.query-builder__row');
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
