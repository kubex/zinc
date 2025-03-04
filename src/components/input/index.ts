import ZnInput from './input.component';

export * from './input.component';
export default ZnInput;

ZnInput.define('zn-input');

declare global {
  interface HTMLElementTagNameMap {
    'zn-input': ZnInput;
  }
}
