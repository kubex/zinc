import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {FormControlController} from "../../internal/form";
import {property, query} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import type {ZincFormControl} from '../../internal/zinc-element';

import styles from './query-builder.scss';
import ZnButton from "../button";
import ZnInput from "../input";
import ZnOption from "../option";
import ZnSelect from "../select";
import type {ZnChangeEvent} from "../../events/zn-change";
import type {ZnInputEvent} from "../../events/zn-input";

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
  Before = 'before',
  After = 'after',
  In = 'in',
  MatchPhrasePre = 'matchphrasepre',
  NMatchPhrasePre = 'nmatchphrasepre',
  MatchPhrase = 'matchphrase',
  NMatchPhrase = 'nmatchphrase',
  Match = 'match',
  NMatch = 'nmatch',
  Starts = 'starts',
  NStarts = 'nstarts',
  Wild = 'wild',
  NWild = 'nwild',
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
  [QueryBuilderOperators.Before]: 'Was Before',
  [QueryBuilderOperators.After]: 'Was After',
  [QueryBuilderOperators.In]: 'In',
  [QueryBuilderOperators.MatchPhrasePre]: 'Match Phrase Prefix',
  [QueryBuilderOperators.NMatchPhrasePre]: 'Does Not Match Phrase Prefix',
  [QueryBuilderOperators.MatchPhrase]: 'Match Phrase',
  [QueryBuilderOperators.NMatchPhrase]: 'Does Not Match Phrase',
  [QueryBuilderOperators.Match]: 'Match',
  [QueryBuilderOperators.NMatch]: 'Does Not Match',
  [QueryBuilderOperators.Starts]: 'Starts With',
  [QueryBuilderOperators.NStarts]: 'Does Not Start With',
  [QueryBuilderOperators.Wild]: 'Wildcard Match',
  [QueryBuilderOperators.NWild]: 'Does Not Match Wildcard',
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
 * @event zn-event-name - Emitted as an example.
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
      <div class="query-builder">
        <zn-select class="add-rule"
                   size="medium"
                   placeholder="Select Filter"
                   @click="${this._addRule}">
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
    const id = value ? value : (event?.target as ZnSelect).value;
    if (id === '') return;

    const filter: QueryBuilderItem | undefined = this.filters.find(item => item.id === id);
    if (filter === undefined) return;

    const uniqueId = Math.random().toString(36).substring(7);
    this._selectedRules.set(uniqueId, {
      id: filter.id,
      name: filter.name,
      operator: filter.operators.length > 0 ? filter.operators[0] : 'eq',
      value: ''
    });
    const row = document.createElement('div');
    row.classList.add('query-builder__row');
    row.id = uniqueId;

    const select = document.createElement('zn-select') as ZnSelect;
    this.filters.forEach(item => {
      const option = document.createElement('zn-option') as ZnOption;
      option.value = item.id;
      option.innerText = item.name.charAt(0).toUpperCase() + item.name.slice(1);
      if (item.id === filter?.id) {
        select.value = item.id;
      }
      select.appendChild(option);
    });
    select.addEventListener('zn-change', (e: ZnChangeEvent) => this._changeRule(uniqueId, e));
    select.classList.add('query-builder__key');

    row.appendChild(select);

    const comparator = document.createElement('zn-select') as ZnSelect;
    const selectedComparator = filter.operators.length > 0 ? filter.operators[0] : QueryBuilderOperators.Eq;
    filter.operators.forEach((item: QueryBuilderOperators) => {
      const option = document.createElement('zn-option') as ZnOption;
      option.value = item;
      option.innerText = operatorText[item as QueryBuilderOperators];
      comparator.appendChild(option);
    });
    comparator.defaultValue = filter.operators[0];
    comparator.addEventListener('zn-change', (e: ZnChangeEvent) => this._updateOperatorValue(uniqueId, e));
    comparator.classList.add('query-builder__comparator');
    if (comparator.querySelectorAll('zn-option').length === 1) {
      comparator.setAttribute('disabled', 'disabled');
    }

    comparator.addEventListener('zn-change', (changeEvent: ZnChangeEvent) => {
      // Date comparisons do not need to change input
      if (filter.type === 'date') return;

      const compareSelect = changeEvent.target as ZnSelect;

      // Comparison the same - no change
      if (compareSelect.value === this._previousOperator) return;

      const input: ZnInput | null = row.querySelector('.query-builder__value');

      // Cannot find input
      if (!input) return;

      const parent = input?.parentElement as HTMLDivElement;
      const compareFilter: CreatedRule | undefined = this._selectedRules.get(uniqueId);
      const newInput = document.createElement('zn-select') as ZnSelect;
      newInput.classList.add('query-builder__value');
      parent.removeChild(input);

      if (compareSelect.value === 'in') {
        newInput.setAttribute('name', 'value');
        newInput.setAttribute('multiple', 'true');
        if (filter.maxOptionsVisible !== undefined) {
          newInput.setAttribute('max-options-visible', filter.maxOptionsVisible);
        }
        newInput.setAttribute('clearable', 'true');
      } else {
        this._updateValue(uniqueId, {target: newInput});
      }

      const options: QueryBuilderOptions | undefined = this.filters.find(item => item.id === compareFilter?.id)?.options;
      if (options !== undefined) {
        this.createOptions(options, newInput);
      }

      newInput.addEventListener('zn-change', (e: ZnChangeEvent) => this._updateValue(uniqueId, e));
      parent.prepend(newInput);
    });

    row.appendChild(comparator);

    let input: ZnSelect | ZnInput;
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
        input = this._createDateInput(uniqueId)
        break;
      }
      default: {
        input = filter.options ? this._createSelectInput(uniqueId, filter, selectedComparator) : this._createDefaultInput(uniqueId);
        break;
      }
    }

    const remove: ZnButton = document.createElement('zn-button');
    remove.setAttribute('icon', 'delete');
    remove.setAttribute('icon-size', '24');
    remove.setAttribute('color', 'transparent');
    remove.setAttribute('size', 'square');
    remove.addEventListener('click', (e: Event) => this._removeRule(uniqueId, e));
    remove.classList.add('query-builder__remove');

    input.classList.add('query-builder__value');
    const wrapper = document.createElement('div');
    wrapper.classList.add('query-builder__wrapper');
    wrapper.appendChild(input);
    wrapper.appendChild(remove);

    row.appendChild(wrapper);

    if (pos !== undefined) {
      this.container.insertBefore(row, this.container.children[pos]);
    } else {
      this.container.insertBefore(row, this.addRule);
    }
    this.addRule.value = '';
    this._handleChange();
  }

  private _createBooleanInput(uniqueId: string): ZnSelect {
    const input = document.createElement('zn-select') as ZnSelect;
    const option1: ZnOption = document.createElement('zn-option');
    option1.value = '1';
    option1.textContent = 'True';
    input.appendChild(option1);
    const option2: ZnOption = document.createElement('zn-option');
    option2.value = '0';
    option2.textContent = 'False';
    input.appendChild(option2);
    input.addEventListener('zn-change', (e: ZnChangeEvent) => this._updateValue(uniqueId, e));
    return input;
  }

  private _createNumberInput(uniqueId: string): ZnInput {
    const input = document.createElement('zn-input');
    input.setAttribute('type', 'number');
    input.addEventListener('zn-input', (e: ZnInputEvent) => this._updateValue(uniqueId, e));
    return input;
  }

  private _createDateInput(uniqueId: string): ZnInput {
    const input = document.createElement('zn-input');
    input.setAttribute('type', 'date');
    input.addEventListener('zn-input', (e: ZnInputEvent) => this._updateValue(uniqueId, e));
    return input;
  }

  private _createSelectInput(uniqueId: string, filter: QueryBuilderItem, selectedComparator: QueryBuilderOperators): ZnSelect {
    const input = document.createElement('zn-select') as ZnSelect;
    const options: QueryBuilderOptions | undefined = this.filters.find(item => item.id === filter?.id)?.options;
    if (options !== undefined) {
      this.createOptions(options, input);
    }

    if (selectedComparator === QueryBuilderOperators.In) {
      input.setAttribute('name', 'value');
      input.setAttribute('multiple', 'true');
      if (filter.maxOptionsVisible !== undefined) {
        input.setAttribute('max-options-visible', filter.maxOptionsVisible);
      }
      input.setAttribute('clearable', 'true');
      input.setAttribute('selectedItems', JSON.stringify(options));
    } else {
      this._updateValue(uniqueId, {target: input});
    }

    input.addEventListener('zn-change', (e: ZnChangeEvent) => this.updateInValue(uniqueId, e));
    return input;
  }

  private _createDefaultInput(uniqueId: string): ZnInput {
    const input = document.createElement('zn-input');
    input.setAttribute('type', 'text');
    input.addEventListener('zn-input', (e: ZnInputEvent) => this._updateValue(uniqueId, e));
    return input;
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
    const button = event.target as ZnSelect;
    button?.parentElement?.remove();
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
    const button = event.target as HTMLButtonElement;
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

  protected createOptions(options: QueryBuilderOptions, selectElement: ZnSelect) {
    Object.keys(options).forEach(item => {
      const option = document.createElement('zn-option') as ZnOption;
      option.value = item;
      option.innerText = options[item] as string;
      selectElement.appendChild(option);
    });
  }
}
