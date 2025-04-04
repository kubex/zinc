import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {property} from 'lit/decorators.js';
import AirDatepicker, {type AirDatepickerLocale} from "air-datepicker";
import ZincElement from '../../internal/zinc-element';

import styles from './datepicker.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/datepicker
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
export default class ZnDatepicker extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({attribute: 'id', reflect: true}) id: string;

  @property({attribute: 'name', reflect: true}) name: string;

  @property({type: Boolean}) range = false;

  private _instance: AirDatepicker<HTMLInputElement>;
  _inputElement: HTMLInputElement;

  initialiseDatepicker() {
    if (this._instance) {
      if (Object.prototype.hasOwnProperty.call(this._instance, 'destroy')) {
        this._instance.destroy();
      }
    }

    const inputElement = this.shadowRoot?.querySelector('input') as HTMLInputElement;
    if (inputElement) {
      this._inputElement = inputElement;
      this._instance = new AirDatepicker(inputElement, {
        locale: enLocale,
        range: this.range
      });
    }
  }

  init() {
    this.initialiseDatepicker();
  }

  protected updated(_changedProperties: PropertyValues) {
    this.init();
    super.updated(_changedProperties);
  }

  render() {
    return html`
      <div class=${classMap({
        'datepicker': true,
        'datepicker--range': this.range,
      })}>
        <div class="datepicker__svg-container">
          <svg aria-hidden="true" fill="currentColor"
               viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clip-rule="evenodd"></path>
          </svg>
        </div>
        <input type="text" placeholder="Select date">
      </div>`;
  }
}

const enLocale: Partial<AirDatepickerLocale> = {
  days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  today: 'Today',
  clear: 'Clear',
  dateFormat: 'mm/dd/yyyy',
  timeFormat: 'hh:ii aa',
  firstDay: 0
};
