import ZnCheckbox from './checkbox.component';

export * from './checkbox.component';
export default ZnCheckbox;

ZnCheckbox.define('zn-checkbox');

declare global {
  interface HTMLElementTagNameMap {
    'zn-checkbox': ZnCheckbox;
  }
}
