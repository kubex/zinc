import {html, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ZincElement} from "../../../ts/element";

import styles from '../scss/DatePicker.scss';
import DateRangePicker from "flowbite-datepicker/js/DateRangePicker";

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

  protected firstUpdated() {
    // @ts-ignore
    this.getRootNode().querySelectorAll('[datepicker]').forEach((datepicker) => {
      const picker = new DateRangePicker(datepicker, {});
    });
  }

  render() {
    return html`
        <div class="flex">
            <span class="flex select-none items-center">${this.prefix}</span>

            <div class="relative max-w-sm">
                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg aria-hidden="true" class="w-md h-md text-gray-500 dark:text-gray-400" fill="currentColor"
                         viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd"
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                              clip-rule="evenodd"></path>
                    </svg>
                </div>
                <input datepicker type="text"
                       class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                       placeholder="Select date">
            </div>

        </div>`
  }
}
