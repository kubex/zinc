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
    ];
  }

  render()
  {
    return html`
      <select name="" id="" multiple class="hidden">
        ${this._data.map((item) => html`
          <option value="${item}">${item}</option>`)}
      </select>

      <div id="selection">
        <span class="selection__container" role="combobox" aria-haspopup="true"
              aria-expanded="${this.visible}" tabindex="-1" aria-disabled="false">
          <ul>
            ${this.selectedItems.map((item) => html`
              <li title="${item}" @click="${e => this.removeSelectedItem(e)}">
                ${item}
              </li>`)}
          </ul>
        </span>
        <div class="inline-search">
          <input type="search" tabindex="0" autocorrect="off" autocapitalize="none" spellcheck="false"
                 autocomplete="off" role="searchbox"
                 placeholder="${this.selectedItems.length > 0 ? '' : 'Select Something'}"
                 @click="${e => this.toggle(e)}"
                 @keyup="${e => this.filter(e)}"/>
        </div>
      </div>

      ${this.visible ? html`
        <div id="options">
          <ul role="listbox" aria-multiselectable="true" aria-expanded="${this.visible}" aria-hidden="false">
            ${this._filteredList && this._filteredList.length === 0 ? html`
              No results found` : this._filteredList.map((item) => html`
              <li aria-selected="${this.isItemSelected(item)}" @click="${e => this.addSelectedItem(e)}">${item}</li>`)}
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
  addSelectedItem(e)
  {
    const item = e.target.innerText;

    // if the item is already selected remove it
    if(this.selectedItems.includes(item))
    {
      return this.removeSelectedItem(e);
    }

    this.selectedItems.push(item);
    this.dispatchEvent(new CustomEvent('multi-select-add-item', {detail: {item}}));

    this.requestUpdate();
  }

  // Remove the item from the selected items
  removeSelectedItem(e)
  {
    const item = e.target.innerText;

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
