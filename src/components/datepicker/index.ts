import ZnDatepicker from './datepicker.component';

export * from './datepicker.component';
export default ZnDatepicker;

ZnDatepicker.define('zn-datepicker');

declare global {
  interface HTMLElementTagNameMap {
    'zn-datepicker': ZnDatepicker;
  }
}
