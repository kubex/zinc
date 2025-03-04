import ZnRadio from './radio.component';

export * from './radio.component';
export default ZnRadio;

ZnRadio.define('zn-radio');

declare global {
  interface HTMLElementTagNameMap {
    'zn-radio': ZnRadio;
  }
}
