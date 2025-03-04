import ZnMultiSelect from './multi-select.component';

export * from './multi-select.component';
export default ZnMultiSelect;

ZnMultiSelect.define('zn-multi-select');

declare global {
  interface HTMLElementTagNameMap {
    'zn-multi-select': ZnMultiSelect;
  }
}
