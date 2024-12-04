import {ZincElement, ZincFormControl} from "@/zinc-element";
import {html, unsafeCSS} from "lit";
import {customElement, property, query} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import type {Option, Select} from "@/FormElements/Select";
import {FormControlController} from "@/form";
import {PropertyValues} from "@lit/reactive-element";
import {MultiSelect} from "@/FormElements/MultiSelect";

import styles from './index.scss?inline';

export type QueryBuilderData = Array<QueryBuilderItem>;

export type QueryBuilderItem = {
  id: string,
  name: string,
  type?: 'bool' | 'boolean' | 'date' | 'number';
  options?: Object,
  operators: Array<QueryBuilderOperators>
}

export type QueryBuilderOperators = 'eq' |
  'neq' |
  'before' |
  'after' |
  'in' |
  'matchphrasepre' |
  'nmatchphrasepre' |
  'matchphrase' |
  'nmatchphrase' |
  'match' |
  'nmatch' |
  'starts' |
  'nstarts' |
  'wild' |
  'nwild' |
  'fuzzy' |
  'nfuzzy' |
  'gte' |
  'gt' |
  'lt' |
  'lte';

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
    if(this.showValues)
    {
      this.showValues.forEach(item =>
      {
        this._addRule(null, item);
      });
    }
    this._handleChange();
    this._formController.updateValidity();
  }

  render()
  {
    return html`
      <div class="query-builder">
        <select class="add-rule" @change="${this._addRule}">
          <option value="">Select Filter</option>
          ${repeat(this.filters,
            (item) => item.id,
            (item) => html`
              <option value="${item.id}">${item.name.charAt(0).toUpperCase() + item.name.slice(1)}</option>`
          )}
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

  private _addRule(event: Event | null, value: string = null)
  {
    const id = value ? value : (event.target as HTMLSelectElement).value;
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

    const select = document.createElement('zn-select') as Select;
    this.filters.forEach(item =>
    {
      const option = document.createElement('zn-option') as Option;
      option.value = item.id;
      option.innerText = item.name.charAt(0).toUpperCase() + item.name.slice(1);
      if(item.id === filter.id)
      {
        select.value = item.id;
      }
      select.appendChild(option);
    });
    select.addEventListener('zn-change', (e: Event) => this._changeRule(uniqueId, e));
    select.classList.add('query-builder__key');

    row.appendChild(select);

    const comparator = document.createElement('zn-select') as Select;
    const selectedComparator = filter.operators.length > 0 ? filter.operators[0] : 'eq';
    filter.operators.forEach(item =>
    {
      const option = document.createElement('zn-option') as Option;
      option.value = item;
      switch(item)
      {
        case 'eq':
          option.innerText = 'Equals';
          break;
        case 'neq':
          option.innerText = 'Not Equals';
          break;
        case 'before':
          option.innerText = 'Was Before';
          break;
        case 'after':
          option.innerText = 'Was After';
          break;
        case 'in':
          option.innerText = 'In';
          break;
        case 'matchphrasepre':
          option.innerText = 'Match Phrase Prefix';
          break;
        case 'nmatchphrasepre':
          option.innerText = 'Does Not Match Phrase Prefix';
          break;
        case 'matchphrase':
          option.innerText = 'Match Phrase';
          break;
        case 'nmatchphrase':
          option.innerText = 'Does Not Match Phrase';
          break;
        case 'match':
          option.innerText = 'Match';
          break;
        case 'nmatch':
          option.innerText = 'Does Not Match';
          break;
        case 'starts':
          option.innerText = 'Starts With';
          break;
        case 'nstarts':
          option.innerText = 'Does Not Start With';
          break;
        case 'wild':
          option.innerText = 'Wildcard Match';
          break;
        case 'nwild':
          option.innerText = 'Does Not Match Wildcard';
          break;
        case 'fuzzy':
          option.innerText = 'Fuzzy Match With';
          break;
        case 'nfuzzy':
          option.innerText = 'Does Not Match Fuzzy With';
          break;
        case 'gte':
          option.innerText = 'Greater Than or Equals';
          break;
        case 'gt':
          option.innerText = 'Greater Than';
          break;
        case 'lt':
          option.innerText = 'Less Than';
          break;
        case 'lte':
          option.innerText = 'Less Than or Equals';
          break;

      }
      comparator.appendChild(option);
    });
    comparator.addEventListener('zn-change', (e: Event) => this._updateOperatorValue(uniqueId, e));
    comparator.classList.add('query-builder__comparator');
    if(comparator.querySelectorAll('zn-options').length === 1)
    {
      comparator.setAttribute('disabled', 'disabled');
    }

    const previousOperator = selectedComparator;
    if(filter.type === 'date')
    {
      // we need to re-render the filter options if the selected value is lt or gt
      comparator.addEventListener('change', (e: Event) =>
      {
        const select = e.target as HTMLSelectElement;
        const input = row.querySelector('.query-builder__value');
        const parent = input.parentElement;
        const filter = this._selectedRules.get(uniqueId);
        parent.removeChild(input);

        if(select.value === 'before' || select.value === 'after')
        {
          const newInput = this._getDateInput(uniqueId, filter.value);
          newInput.setAttribute('type', 'number');
          newInput.setAttribute('name', 'value');
          newInput.classList.add('query-builder__value');
          parent.appendChild(newInput);
        }
        else
        {
          const newInput = document.createElement('input');
          newInput.classList.add('query-builder__value');
          newInput.value = filter.value;
          this._updateValue(uniqueId, {target: newInput});
          newInput.setAttribute('type', 'date');
          newInput.addEventListener('input', (e: Event) => this._updateValue(uniqueId, e));
          parent.appendChild(newInput);
        }
      });
    }
    else
    {
      comparator.addEventListener('change', (e: Event) =>
      {
        // if selected comparator is in
        const selectedComparator = (e.target as HTMLSelectElement).value;
        if(selectedComparator !== previousOperator && selectedComparator === 'in')
        {
          const input = row.querySelector('.query-builder__value');
          const parent = input.parentElement;
          parent.removeChild(input);

          const newInput = document.createElement('zn-multi-select');
          newInput.classList.add('query-builder__value');
          newInput.setAttribute('name', 'value');
          newInput.setAttribute('label', 'Value');
          newInput.addEventListener('change', (e: Event) => this.updateInValue(uniqueId, e));
          newInput.setAttribute('data', JSON.stringify(filter.options));
          parent.appendChild(newInput);
        }
        else if(selectedComparator !== previousOperator)
        {
          const input = row.querySelector('.query-builder__value');
          const parent = input.parentElement;
          const filter = this._selectedRules.get(uniqueId);
          parent.removeChild(input);


          const newInput = document.createElement('zn-select') as Select;
          newInput.classList.add('query-builder__value');

          const options = this.filters.find(item => item.id === filter.id).options;
          Object.keys(options).forEach(item =>
          {
            const option = document.createElement('zn-option') as Option;
            option.value = item;
            option.innerHTML = options[item];
            newInput.appendChild(option);
          });

          this._updateValue(uniqueId, {target: newInput});
          newInput.addEventListener('change', (e: Event) => this._updateValue(uniqueId, e));

          parent.appendChild(newInput);
        }
      });
    }

    row.appendChild(comparator);

    let input: Select | HTMLInputElement | HTMLDivElement | MultiSelect;
    if(filter.options)
    {
      input = document.createElement('zn-select') as Select;
      const options = Object.keys(filter.options);
      options.forEach(item =>
      {
        const option = document.createElement('zn-option') as Option;
        option.value = item;
        option.innerText = filter.options[item];
        input.appendChild(option);
      });
      this._updateValue(uniqueId, {target: input});
      input.addEventListener('change', (e: Event) => this._updateValue(uniqueId, e));
    }
    else if(filter.type === 'bool' || filter.type === 'boolean')
    {
      input = document.createElement('zn-select') as Select;
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
    else if(filter.type === 'number')
    {
      input = document.createElement('input');
      input.setAttribute('type', 'number');
      input.addEventListener('input', (e: Event) => this._updateValue(uniqueId, e));
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
        input.setAttribute('type', 'date');
        input.addEventListener('input', (e: Event) => this._updateValue(uniqueId, e));
      }
    }
    else if(selectedComparator === 'in')
    {
      input = document.createElement('zn-multi-select') as MultiSelect;
      input.setAttribute('name', 'value');
      input.setAttribute('label', 'Value');
      input.setAttribute('selectedItems', JSON.stringify(filter.options));
      input.addEventListener('zn-change', (e: Event) => this.updateInValue(uniqueId, e));
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
    this._handleChange();
  }

  private _updateValue(id: string, event: Event | { target: Select | HTMLInputElement | HTMLDivElement })
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
    const date = parent.querySelector('zn-select[name="date"]') as HTMLSelectElement;
    const ago = parent.querySelector('zn-select[name="ago"]') as HTMLSelectElement;

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

  private updateInValue(id: string, event: Event)
  {
    const filter = this._selectedRules.get(id);
    if(!filter) return;

    const input = event.target as MultiSelect;
    const inputValue = input.value;
    // @ts-expect-error value does exists, it's been annoying
    filter.value = inputValue.split(',');

    this._selectedRules.set(id, filter);
    this._handleChange();

  }

  private _changeRule(id: string, event: Event)
  {
    // remove the element from the dom
    const button = event.target as HTMLSelectElement;
    button.parentElement.remove();
    // recreate the element based on the selected value;
    this._removeRule(id, event);
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

  protected _getDateInput(uniqueId: string, value: string): HTMLDivElement | HTMLInputElement | Select
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
    const dropdown = document.createElement('zn-select') as Select;
    dropdown.setAttribute('name', 'date');
    dropdown.addEventListener('zn-change', (e: Event) => this._updateDateValue(uniqueId, e));

    const options = {
      '1': 'Minutes',
      '60': 'Hours',
      '1440': 'Days',
      '10080': 'Weeks'
    };
    Object.keys(options).forEach(item =>
    {
      const option = document.createElement('zn-option') as Option;
      option.value = item;
      option.innerText = options[item];
      dropdown.appendChild(option);
    });

    // dropdown ago or from now
    const ago = document.createElement('zn-select') as Select;
    ago.setAttribute('name', 'ago');
    ago.addEventListener('zn-change', (e: Event) => this._updateDateValue(uniqueId, e));

    const agoOptions = {
      '-1': 'From Now',
      '1': 'Ago'
    };

    Object.keys(agoOptions).forEach(item =>
    {
      const option = document.createElement('zn-option') as Option;
      option.value = item;
      option.innerText = agoOptions[item];
      ago.appendChild(option);
    });

    input.appendChild(number);
    input.appendChild(dropdown);
    input.appendChild(ago);

    return input;
  }
}


