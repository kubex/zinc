import ZnColorPicker from './color-picker.component';

export * from './color-picker.component';
export default ZnColorPicker;

ZnColorPicker.define('zn-color-picker');

declare global {
  interface HTMLElementTagNameMap {
    'zn-color-picker': ZnColorPicker;
  }
}
