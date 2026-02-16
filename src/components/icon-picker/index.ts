import ZnIconPicker from './icon-picker.component';

export * from './icon-picker.component';
export default ZnIconPicker;

ZnIconPicker.define('zn-icon-picker');

declare global {
  interface HTMLElementTagNameMap {
    'zn-icon-picker': ZnIconPicker;
  }
}
