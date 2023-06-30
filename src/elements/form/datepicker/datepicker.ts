import {html, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ZincElement} from "../../../ts/element";

import styles from './datepicker.scss';

@customElement('zn-datepicker')
export class ZincDatePicker extends ZincElement {
  static get styles() {
    return [unsafeCSS(styles)];
  }

  @property({attribute: 'id', type: String, reflect: true})
  public id;
  @property({attribute: 'name', type: String, reflect: true})
  private name;

  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <div class="flex">
        <span class="flex select-none items-center">${this.prefix}</span>
        <div class="relative max-w-sm">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          </div>
          <input datepicker type="text"
                 class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                 placeholder="Select date">
        </div>

      </div>`
  }
}
