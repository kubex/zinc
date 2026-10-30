import ZnColorSelect from './color-select.component';

export * from './color-select.component';
export default ZnColorSelect;

ZnColorSelect.define('zn-color-select');

declare global {
  interface HTMLElementTagNameMap {
    'zn-color-select': ZnColorSelect;
  }
}
