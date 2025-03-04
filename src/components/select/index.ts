import ZnSelect from './select.component';

export * from './select.component';
export default ZnSelect;

ZnSelect.define('zn-select');

declare global {
  interface HTMLElementTagNameMap {
    'zn-select': ZnSelect;
  }
}
