import {property, query} from 'lit/decorators.js';
import {type CSSResultGroup, html, PropertyValues, unsafeCSS} from 'lit';
import ZincElement from '../../internal/zinc-element';
import {FormControlController} from "../../internal/form";
import {classMap} from "lit/directives/class-map.js";

import styles from './bulk-actions.scss';

export type CreatedRule = {
  id: string,
  name: string
  value: string
}

export type BulkActionData = Array<BulkActionItem>;

export type BulkActionItem = {
  id: string,
  name: string,
  type?: 'bool' | 'boolean' | 'date' | 'number';
  options?: {
    [key: string]: string
  },
}

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/bulk-actions
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
export default class ZnBulkActions extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @query('.bulk-actions') container: HTMLDivElement;
  @query('.add-rule') addRule: HTMLSelectElement;
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
    return this.input.validity;
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
        <select class="add-rule" @change="${this._addRule}">
          <option value="">Select Filter</option>
          ${this.actions.map((item: any) => html`
            <option value="${item.id}">${item.name.charAt(0).toUpperCase() + item.name.slice(1)}</option>`)}
        </select>
        <input id="main-input" name="${this.name}" value="${this.value}" type="hidden">
      </div>
    `;
  }

  private _handleChange() {
    const data: any = [];
    [...this._selectedRules].forEach(([_, value]) => {
      data.push({
        key: value.id,
        value: value.value
      });
    });

    this.value = btoa(JSON.stringify(data));
  }

  private _addRule(event: Event | null, value: string = "") {
    const id = value ? value : event ? (event.target as HTMLSelectElement).value : '';
    if (id === '') return;

    const filter = this.actions.find(item => item.id === id);
    if (!filter) return;

    const uniqueId = Math.random().toString(36).substring(7);
    this._selectedRules.set(uniqueId, {
      id: filter.id,
      name: filter.name,
      value: ''
    });

    const row = document.createElement('div');
    row.classList.add('query-builder__row');
    row.id = uniqueId;

    const select = document.createElement('select');
    this.actions.forEach(item => {
      const option = document.createElement('option');
      option.value = item.id;
      option.text = item.name.charAt(0).toUpperCase() + item.name.slice(1);
      option.selected = item.id === filter.id;
      select.appendChild(option);
    });
    select.addEventListener('change', (e: Event) => this._changeRule(uniqueId, e));
    select.classList.add('query-builder__key');

    row.appendChild(select);

    let input: HTMLSelectElement | HTMLInputElement | HTMLDivElement;
    if (filter.options) {
      input = document.createElement('select');
      const options = Object.keys(filter.options);
      options.forEach((item: string) => {
        const option = document.createElement('option');
        option.value = item;
        option.text = filter.options ? (filter.options[item]) : '';
        input.appendChild(option);
      });
      this._updateValue(uniqueId, {target: input});
      input.addEventListener('change', (e: Event) => this._updateValue(uniqueId, e));
    } else if (filter.type === 'bool' || filter.type === 'boolean') {
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
    } else if (filter.type === 'number') {
      input = document.createElement('input');
      input.setAttribute('type', 'number');
      input.addEventListener('input', (e: Event) => this._updateValue(uniqueId, e));
    } else if (filter.type === 'date') {
      input = document.createElement('input');
      input.setAttribute('type', 'date');
      input.addEventListener('input', (e: Event) => this._updateValue(uniqueId, e));
    } else {
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

  private _updateValue(id: string, event: Event | { target: HTMLSelectElement | HTMLInputElement | HTMLDivElement }) {
    const filter = this._selectedRules.get(id);
    if (!filter) return;

    const input = event.target as HTMLSelectElement | HTMLInputElement;
    filter.value = input.value;

    this._selectedRules.set(id, filter);
    this._handleChange();
  }

  private _changeRule(id: string, event: Event) {
    // remove the element from the dom
    const button = event.target as HTMLSelectElement;
    button.parentElement?.remove();
    // recreate the element based on the selected value;
    this._removeRule(id, event);
    this._addRule(event);
  }

  private _removeRule(id: string, event: Event) {
    this._selectedRules.delete(id);
    const button = event.target as HTMLButtonElement;
    button.parentElement?.remove();
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
