import {html, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ZincElement} from "../../../ts/element";
import AirDatepicker, {AirDatepickerOptions} from "air-datepicker";
import {PropertyValues} from "@lit/reactive-element";
import localeEn from 'air-datepicker/locale/en';

import styles from './datepicker.scss';

@customElement('zn-datepicker')
export class ZincDatePicker extends ZincElement {
  @property({attribute: 'id', type: String, reflect: true}) id;
  @property({attribute: 'name', type: String, reflect: true}) name;

  private _inputElement: HTMLInputElement;
  private _instance: AirDatepicker<HTMLInputElement>;

  static get styles() {
    return [unsafeCSS(styles)];
  }

  async initialiseDatepicker() {
    if (this._instance) {
      if (Object.prototype.hasOwnProperty.call(this._instance, 'destroy')) {
        this._instance.destroy();
      }
    }

    let inputElement: HTMLInputElement | null;

    inputElement = this.shadowRoot?.querySelector('input') as HTMLInputElement;
    console.log("input element", inputElement);
    if (inputElement) {
      this._inputElement = inputElement;
      const options = await this.getOptions();
      this._instance = new AirDatepicker(inputElement, options);
    }
  }


  async init() {
    await this.initialiseDatepicker();
  }

  protected updated(_changedProperties: PropertyValues) {
    super.updated(_changedProperties);
    this.init();
  }

  render() {
    return html`
      <div class="datepicker__svg-container">
        <svg aria-hidden="true" fill="currentColor"
             viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clip-rule="evenodd"></path>
        </svg>
      </div>
      <input type="text" placeholder="Select date">`
  }

  private async getOptions(): Promise<Partial<AirDatepickerOptions>> {
    let options: Partial<AirDatepickerOptions> = {
      locale: localeEn
    }

    return options;
  }
}