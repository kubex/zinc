import ZnKeyValue from './key-value.component';

export * from './key-value.component';
export default ZnKeyValue;

ZnKeyValue.define('zn-key-value');

declare global {
  interface HTMLElementTagNameMap {
    'zn-key-value': ZnKeyValue;
  }
}
