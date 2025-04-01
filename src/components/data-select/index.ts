import ZnDataSelect from './data-select.component';

export * from './data-select.component';
export default ZnDataSelect;

ZnDataSelect.define('zn-data-select');

declare global {
  interface HTMLElementTagNameMap {
    'zn-data-select': ZnDataSelect;
  }
}
