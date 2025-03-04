import ZnOption from './option.component';

export * from './option.component';
export default ZnOption;

ZnOption.define('zn-option');

declare global {
  interface HTMLElementTagNameMap {
    'zn-option': ZnOption;
  }
}
