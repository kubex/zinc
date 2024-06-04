import { ZincElement, ZincFormControl } from "@/zinc-element";
import { html, unsafeCSS } from "lit";
import { customElement, property, query } from 'lit/decorators.js';

import styles from './index.scss?inline';
import { classMap } from "lit/directives/class-map.js";
import { FormControlController } from "@/form";
import { PropertyValues } from "@lit/reactive-element";

export type QueryBuilderData = Array<QueryBuilderItem>;

export type QueryBuilderItem = {
  id: string,
  name: string,
  options: Array<string> | null,
  operators: Array<QueryBuilderOperators>
}

export type QueryBuilderOperators = 'eq' | 'neq';

export type CreatedRule = {
  id: string,
  name: string
  operator: string,
  value: string
}

@customElement('zn-query-builder')
export class QueryBuilder extends ZincElement implements ZincFormControl
{
  static styles = unsafeCSS(styles);

  private _selectedRules: Map<string, CreatedRule> = new Map<string, CreatedRule>();
  private _formController: FormControlController = new FormControlController(this, {});

  @query('.query-builder') container: HTMLDivElement;
  @query('.add-rule') addRule: HTMLSelectElement;
  @query('input#main-input') input: HTMLInputElement;

  @property({ type: Array }) filters: QueryBuilderData = [];


  @property() name: string;
  @property() value: PropertyKey;

  get validationMessage(): string
  {
    return '';
  }

  get validity(): ValidityState
  {
    return this.input.validity;
  }

  protected firstUpdated(_changedProperties: PropertyValues)
  {
    super.firstUpdated(_changedProperties);
    this._handleChange();
    this._formController.updateValidity();
  }

  render()
  {
    return html`
      <div class="${classMap({
        'query-builder': true
      })}">
        <select class="add-rule" @change="${this._addRule}">
          <option value="">Select Filter</option>
          ${this.filters.map(item => html`
            <option value="${item.id}">${item.name.charAt(0).toUpperCase() + item.name.slice(1)}</option>`)}
        </select>
        <input id="main-input" name="${this.name}" value="${this.value}" type="hidden">
      </div>
    `;
  }

  private _handleChange()
  {
    const data = [];
    console.log(this._selectedRules);
    [...this._selectedRules].forEach(([key, value]) =>
    {
      data.push({
        key: value.id,
        comparator: value.operator,
        value: value.value
      });
    });

    this.value = btoa(JSON.stringify(data));
    console.log(this.value);
  }

  private _addRule(event: Event)
  {
    const id = (event.target as HTMLSelectElement).value;
    if(id === '') return;

    const filter = this.filters.find(item => item.id === id);
    if(!filter) return;

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

    const select = document.createElement('select');
    this.filters.forEach(item =>
    {
      const option = document.createElement('option');
      option.value = item.id;
      option.text = item.name.charAt(0).toUpperCase() + item.name.slice(1);
      option.selected = item.id === filter.id;
      select.appendChild(option);
    });
    select.addEventListener('change', (e: Event) => this._changeRule(uniqueId, e));
    select.classList.add('query-builder__key');

    row.appendChild(select);

    const comparator = document.createElement('select');
    filter.operators.forEach(item =>
    {
      const option = document.createElement('option');
      option.value = item;
      switch(item)
      {
        case 'eq':
          option.text = 'Equals';
          break;
        case 'neq':
          option.text = 'Not Equals';
          break;
      }
      comparator.appendChild(option);
    });
    comparator.addEventListener('change', (e: Event) => this._updateOperatorValue(uniqueId, e));
    comparator.classList.add('query-builder__comparator');
    row.appendChild(comparator);

    let input: HTMLSelectElement | HTMLInputElement;
    if(filter.options)
    {
      input = document.createElement('select');
      filter.options.forEach(item =>
      {
        const option = document.createElement('option');
        option.value = item;
        option.text = item;
        input.appendChild(option);
      });
      input.addEventListener('change', (e: Event) => this._updateValue(uniqueId, e));
    }
    else
    {
      input = document.createElement('input');
      input.setAttribute('type', 'text');
      input.addEventListener('input', (e: Event) => this._updateValue(uniqueId, e));
    }
    input.classList.add('query-builder__value');
    row.appendChild(input);

    const remove = document.createElement('zn-button');
    remove.setAttribute('icon', 'delete');
    remove.setAttribute('icon-size', '24');
    remove.setAttribute('color', 'transparent');
    remove.setAttribute('size', 'square');
    remove.addEventListener('click', (e: Event) => this._removeRule(uniqueId, e));
    remove.classList.add('query-builder__remove');
    row.appendChild(remove);

    this.container.insertBefore(row, this.addRule);
    this.addRule.value = '';
    this._handleChange();
  }

  private _updateOperatorValue(id: string, event: Event)
  {
    const filter = this._selectedRules.get(id);
    if(!filter) return;

    const select = event.target as HTMLSelectElement;
    filter.operator = select.value as QueryBuilderOperators;

    this._selectedRules.set(id, filter);
  }

  private _updateValue(id: string, event: Event)
  {
    const filter = this._selectedRules.get(id);
    if(!filter) return;

    const input = event.target as HTMLSelectElement | HTMLInputElement;
    filter.value = input.value;

    this._selectedRules.set(id, filter);
    this._handleChange();
  }

  private _changeRule(id: string, event: Event)
  {
    // remove the element from the dom
    const button = event.target as HTMLSelectElement;
    button.parentElement.remove();
    // recreate the elemnent based on the selected value;
    this._addRule(event);
  }

  private _removeRule(id: string, event: Event)
  {
    this._selectedRules.delete(id);
    const button = event.target as HTMLButtonElement;
    button.parentElement.remove();
    this._handleChange();
  }

  checkValidity(): boolean
  {
    return this.input.checkValidity();
  }

  getForm(): HTMLFormElement | null
  {
    return this._formController.getForm();
  }

  reportValidity(): boolean
  {
    return this.input.reportValidity();
  }

  setCustomValidity(message: string): void
  {
    this.input.setCustomValidity(message);
    this._formController.updateValidity();
  }
}


