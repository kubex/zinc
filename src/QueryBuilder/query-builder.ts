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
  type?: 'bool' | 'boolean' | 'date',
  options?: Object,
  operators: Array<QueryBuilderOperators>
}

export type QueryBuilderOperators = 'eq' | 'neq' | 'before' | 'after';

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
    [...this._selectedRules].forEach(([key, value]) =>
    {
      data.push({
        key: value.id,
        comparator: value.operator,
        value: value.value
      });
    });

    this.value = btoa(JSON.stringify(data));
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
    const selectedComparator = filter.operators.length > 0 ? filter.operators[0] : 'eq';
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
        case 'before':
          option.text = 'Less Than';
          break;
        case 'after':
          option.text = 'Greater Than';
          break;
      }
      comparator.appendChild(option);
    });
    comparator.addEventListener('change', (e: Event) => this._updateOperatorValue(uniqueId, e));
    comparator.classList.add('query-builder__comparator');
    if(comparator.options.length === 1)
    {
      comparator.setAttribute('disabled', 'disabled');
    }

    if(filter.type === 'date')
    {
      // we need to re render the filter options if the selected value is lt or gt
      comparator.addEventListener('change', (e: Event) =>
      {
        const select = e.target as HTMLSelectElement;
        if(select.value === 'before' || select.value === 'after')
        {
          const input = row.querySelector('.query-builder__value');
          const parent = input.parentElement;
          parent.removeChild(input);
          const filter = this._selectedRules.get(uniqueId);
          const newInput = this._getDateInput(uniqueId, filter.value);
          newInput.setAttribute('type', 'number');
          newInput.setAttribute('name', 'value');
          newInput.classList.add('query-builder__value');
          parent.appendChild(newInput);
        }
        else
        {
          const input = row.querySelector('.query-builder__value');
          const parent = input.parentElement;
          const filter = this._selectedRules.get(uniqueId);
          parent.removeChild(input);

          const newInput = document.createElement('input');
          newInput.classList.add('query-builder__value');
          newInput.value = filter.value;
          this._updateValue(uniqueId, { target: newInput });
          newInput.setAttribute('type', 'number');
          newInput.addEventListener('input', (e: Event) => this._updateValue(uniqueId, e));
          parent.appendChild(newInput);
        }
      });
    }

    row.appendChild(comparator);

    let input: HTMLSelectElement | HTMLInputElement | HTMLDivElement;
    if(filter.options)
    {
      input = document.createElement('select');
      const options = Object.keys(filter.options);
      options.forEach(item =>
      {
        const option = document.createElement('option');
        option.value = item;
        option.text = filter.options[item];
        input.appendChild(option);
      });
      input.addEventListener('change', (e: Event) => this._updateValue(uniqueId, e));
    }
    else if(filter.type === 'bool' || filter.type === 'boolean')
    {
      input = document.createElement('select');
      const option1 = document.createElement('option');
      option1.value = '1';
      option1.text = 'True';
      input.appendChild(option1);
      const option2 = document.createElement('option');
      option2.value = '0';
      option2.text = 'False';
      input.appendChild(option2);
      input.addEventListener('change', (e: Event) => this._updateValue(uniqueId, e));
    }
    else if(filter.type === 'date')
    {
      if(selectedComparator === 'before' || selectedComparator === 'after')
      {
        input = this._getDateInput(uniqueId, null);
      }
      else
      {
        input = document.createElement('input');
        input.setAttribute('type', 'number');
        input.addEventListener('input', (e: Event) => this._updateValue(uniqueId, e));
      }
    }
    else
    {
      input = document.createElement('input');
      input.setAttribute('type', 'text');
      input.addEventListener('input', (e: Event) => this._updateValue(uniqueId, e));
    }

    input.classList.add('query-builder__value');
    const wrapper = document.createElement('div');
    wrapper.classList.add('query-builder__wrapper');
    wrapper.appendChild(input);
    row.appendChild(wrapper);

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

  private _updateValue(id: string, event: Event | { target: HTMLSelectElement | HTMLInputElement | HTMLDivElement })
  {
    const filter = this._selectedRules.get(id);
    if(!filter) return;

    const input = event.target as HTMLSelectElement | HTMLInputElement;
    filter.value = input.value;

    this._selectedRules.set(id, filter);
    this._handleChange();
  }

  private _updateDateValue(id: string, event: Event)
  {
    const filter = this._selectedRules.get(id);
    if(!filter) return;

    const parent = (event.target as HTMLElement).parentElement;
    const number = parent.querySelector('input[name="number"]') as HTMLInputElement;
    const date = parent.querySelector('select[name="date"]') as HTMLSelectElement;
    const ago = parent.querySelector('select[name="ago"]') as HTMLSelectElement;

    let value = number.value;
    if(date.value !== '1')
    {
      value = (parseInt(number.value) * parseInt(date.value)).toString();
    }

    if(ago.value === '1')
    {
      value = '-' + value;
    }

    filter.value = value;
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


  protected _getDateInput(uniqueId: string, value: string): HTMLDivElement | HTMLInputElement | HTMLSelectElement
  {
    // split into group
    const input = document.createElement('div');
    input.classList.add('query-builder__date');

    // number input
    const number = document.createElement('input');
    number.setAttribute('type', 'number');
    number.setAttribute('name', 'number');
    number.value = value ? value : '';
    number.addEventListener('input', (e: Event) => this._updateDateValue(uniqueId, e));

    // dropdown for minutes, hours, days, weeks
    const dropdown = document.createElement('select');
    dropdown.setAttribute('name', 'date');
    dropdown.addEventListener('change', (e: Event) => this._updateDateValue(uniqueId, e));
    const minutes = document.createElement('option');
    minutes.value = '1';
    minutes.text = 'Minutes';
    dropdown.appendChild(minutes);
    const hours = document.createElement('option');
    hours.value = '60';
    hours.text = 'Hours';
    dropdown.appendChild(hours);
    const days = document.createElement('option');
    days.value = '1440';
    days.text = 'Days';
    dropdown.appendChild(days);
    const weeks = document.createElement('option');
    weeks.value = '10080';
    weeks.text = 'Weeks';
    dropdown.appendChild(weeks);

    // dropdown ago or from now
    const ago = document.createElement('select');
    ago.setAttribute('name', 'ago');
    ago.addEventListener('change', (e: Event) => this._updateDateValue(uniqueId, e));
    const from = document.createElement('option');
    from.value = '-1';
    from.text = 'From Now';

    const to = document.createElement('option');
    to.value = '1';
    to.text = 'To Now';
    ago.appendChild(from);
    ago.appendChild(to);

    input.appendChild(number);
    input.appendChild(dropdown);
    input.appendChild(ago);

    return input;
  }
}


