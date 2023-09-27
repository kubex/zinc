import {html, LitElement, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss';

@customElement('zn-multi-select')
export class MultiSelect extends LitElement
{
  static styles = unsafeCSS(styles);

  @property({type: Boolean,}) visible = false;
  @property({type: Array}) selectedItems = [];

  private _filteredList = [];
  private _data = [];

  private _scrollPosition = 0;

  constructor()
  {
    super();
    this._data = this.getData();
    this._filteredList = this._data;
  }


  // This will benefit from adding the ability to use ajax to fetch data, or passing it via a property
  getData()
  {
    // return some example data for now
    return [
      'South Africa',
      'United Kingdom',
      'United States',
      'France',
      'Germany',
      'Spain',
      'Italy',
      'China',
      'Japan',
      'Australia',
    ];
  }

  render()
  {
    // if visible keep multi-select focused
    if(this.visible)
    {
      const input = this.shadowRoot.querySelector('.multi-select__filter input') as HTMLInputElement | null;
      input?.focus();
    }

    const dropdown = this.shadowRoot.querySelector('.multi-select__dropdown') as HTMLElement | null;
    if(dropdown)
    {
      dropdown.scrollTop = this._scrollPosition;
      dropdown.addEventListener('scroll', (e) => this._scrollPosition = dropdown.scrollTop);
    }


    return html`
      <div class="multi-select ${this.visible ? 'multi-select--open' : ''}" @click="${e => this.toggle(e)}">
        <select name="" id="" multiple class="hidden">
          ${this._data.map((item) => html`
            <option value="${item}">${item}</option>`)}
        </select>

        <span class="multi-select__selection" role="combobox" aria-haspopup="true"
              aria-expanded="${this.visible}" tabindex="-1" aria-disabled="false">
          ${this.selectedItems.length > 0 ? '' : html`
            <div class="multi-select__placeholder">Please Select...</div>`}
          <ul>
            ${this.selectedItems.map((item) => html`
              <li title="${item}" class="multi-select__item">
                <span @click="${e => this.removeSelectedItem(item)}">Remove</span>
                ${item}
              </li>`)}
          </ul>
        </span>
      </div>

      ${this.visible ? html`
        <div class="multi-select__dropdown">
          <div class="multi-select__trigger multi-select__filter">
            <input type="search" tabindex="0" autocorrect="off" autocapitalize="none" spellcheck="false"
                   autocomplete="off" role="searchbox"
                   placeholder="Search"
                   @keyup="${e => this.filter(e)}"/>
          </div>
          <ul role="listbox" aria-multiselectable="true" aria-expanded="${this.visible}" aria-hidden="false">
            ${this._filteredList && this._filteredList.length === 0 ? html`
              <div class="multi-select__placeholder" style="padding-left: 10px">No Results Found...
              </div>` : this._filteredList.map((item) => html`
              <li aria-selected="${this.isItemSelected(item)}"
                  class="multi-select__dropdown__item ${this.isItemSelected(item) ? 'multi-select__dropdown__item--selected' : ''}"
                  @click="${e => this.addSelectedItem(item)}">${item}
              </li>`)}
          </ul>
        </div>` : null}
    `;
  }

// Check if the item is in the selected items
  isItemSelected(item)
  {
    return this.selectedItems.includes(item);
  }


  // When the element is connected add the click event that will close the dropdown on click away
  connectedCallback()
  {
    super.connectedCallback();
    document.addEventListener('click', (e: MouseEvent) =>
    {
      const node = e.target as HTMLElement;
      if(!this.contains(node))
      {
        this.visible = false;
        this.dispatchEvent(new CustomEvent('multi-select-toggle', {detail: {visible: this.visible}}));
        this._filteredList = this._data;
        const input = this.shadowRoot.querySelector('.multi-select__filter input') as HTMLInputElement | null;
        if(input)
        {
          input.value = '';
        }
      }
    });
  }

  // Filter the options based on the text in the text area
  filter(e)
  {
    this.visible = true;

    // Prevent enter from submitting the form if there is one
    if(e.keyCode === 13)
    {
      e.preventDefault();
      return;
    }

    const text = e.target.value.toLowerCase();
    this._filteredList = this._data.filter((item) => item.toLowerCase().includes(text));
    this.requestUpdate();
  }

  // On click of the text area toggle the dropdown
  toggle(e)
  {
    this.visible = !this.visible;
    this.dispatchEvent(new CustomEvent('multi-select-toggle', {detail: {visible: this.visible}}));
  }

  // On click of an option add it to the selected items
  addSelectedItem(item)
  {

    // if the item is already selected remove it
    if(this.selectedItems.includes(item))
    {
      return this.removeSelectedItem(item);
    }

    this.selectedItems.push(item);
    this.dispatchEvent(new CustomEvent('multi-select-add-item', {detail: {item}}));

    this.requestUpdate();
  }

  // Remove the item from the selected items
  removeSelectedItem(item)
  {
    if(!this.selectedItems.includes(item))
    {
      return;
    }

    this.selectedItems = this.selectedItems.filter((i) => i !== item);
    this.dispatchEvent(new CustomEvent('multi-select-remove-item', {detail: {item}}));

    // trigger a re-render
    this.requestUpdate();
  }

  // on request update make sure the select is updated with the selected items
  updated()
  {
    const select: HTMLSelectElement = this.shadowRoot.querySelector('select');
    select.value = this.selectedItems.join(',');
  }
}
