import { html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import styles from './index.scss?inline';
import { ZincElement, ZincFormControl } from "@/zinc-element";
import { FormControlController, validValidityState } from "@/form";
import { PropertyValues } from "@lit/reactive-element";

@customElement('zn-multi-select')
export class MultiSelect extends ZincElement implements ZincFormControl
{
  static styles = unsafeCSS(styles);

  @property({ type: Boolean }) visible = false;
  @property({ type: Array, attribute: 'selected-items' }) selectedItems = [];
  @property({ type: Array }) data = [];

  @property() name: string = "";
  @property() value: string;


  private _scrollPosition = 0;

  private readonly formControlController = new FormControlController(this, {
    value: (control: MultiSelect) => control.selectedItems.join(','),
  });

  get validity()
  {
    return validValidityState;
  }

  get validationMessage()
  {
    return '';
  }

  protected firstUpdated(_changedProperties: PropertyValues)
  {
    super.firstUpdated(_changedProperties);
    this.formControlController.updateValidity();
  }

  checkValidity(): boolean
  {
    return true;
  }

  getForm(): HTMLFormElement | null
  {
    return this.formControlController.getForm();
  }

  reportValidity(): boolean
  {
    return true;
  }

  setCustomValidity(message: string): void
  {
    this.formControlController.updateValidity();
  }

  render()
  {
    const dropdown = this.shadowRoot.querySelector('.multi-select__dropdown') as HTMLElement | null;
    if(dropdown)
    {
      dropdown.addEventListener('scroll', (e) => this._scrollPosition = dropdown.scrollTop);
      dropdown.scrollTop = this._scrollPosition;
    }

    const options = Object.keys(this.data);

    return html`
      <div class="multi-select ${this.visible ? 'multi-select--open' : ''}" @click="${e => this.toggle(e)}">
        <span class="multi-select__selection" role="combobox" aria-haspopup="true"
              aria-expanded="${this.visible}" tabindex="-1" aria-disabled="false">
          <span class="container">
          ${this.selectedItems.length > 0 ? '' : html`
            <div class="multi-select__placeholder">Please Select...</div>`}
          <ul>
            ${this.selectedItems.map((item) => html`
              <li title="${item}" class="multi-select__item">
                <span @click="${e => this.removeSelectedItem(e, item)}">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" viewBox="0 0 24 24"><path
                    fill="none" d="M0 0h24v24H0z"/><path fill="currentColor"
                                                         d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                </span>
                ${this.data[item]}
              </li>`)}
          </ul>
          </span>
          <span class="opener"><svg xmlns="http://www.w3.org/2000/svg" width="12px" viewBox="0 0 12 8"><path
            fill="#7B7097" d="m6 7.4-6-6L1.4 0 6 4.6 10.6 0 12 1.4z"/></svg></span>
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
            ${options && options.length === 0 ? html`
              <div class="multi-select__placeholder" style="padding-left: 10px">No Results Found...
              </div>` : options.map((item) => html`
              <li aria-selected="${this.isItemSelected(item)}"
                  class="multi-select__dropdown__item ${this.isItemSelected(item) ? 'multi-select__dropdown__item--selected' : ''}"
                  @click="${e => this.addSelectedItem(e, item)}">${this.data[item]}
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

    this.requestUpdate();
  }

  // On click of the text area toggle the dropdown
  toggle(e)
  {
    e.preventDefault();
    this.visible = !this.visible;
    this.dispatchEvent(new CustomEvent('multi-select-toggle', { detail: { visible: this.visible } }));
  }

  // On click of an option add it to the selected items
  addSelectedItem(e, item)
  {
    // if the item is already selected remove it
    if(this.selectedItems.includes(item))
    {
      return this.removeSelectedItem(e, item);
    }

    this.selectedItems.push(item);

    this.value = this.selectedItems.join(',');
    this.dispatchEvent(new CustomEvent('multi-select-add-item', { detail: { item } }));
    this.dispatchEvent(new CustomEvent('change', { detail: { value: this.value } }));
    this.requestUpdate();
  }

  // Remove the item from the selected items
  removeSelectedItem(e, item)
  {
    e.preventDefault();
    if(!this.selectedItems.includes(item))
    {
      return;
    }

    this.selectedItems = this.selectedItems.filter((i) => i !== item);

    this.value = this.selectedItems.join(',');
    this.dispatchEvent(new CustomEvent('multi-select-remove-item', { detail: { item } }));
    this.dispatchEvent(new CustomEvent('change', { detail: { value: this.value } }));
    this.requestUpdate();
  }
}
