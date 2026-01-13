import ZnKey from './key.component';

export * from './key.component';
export default ZnKey;

ZnKey.define('zn-key');

declare global {
  interface HTMLElementTagNameMap {
    'zn-key': ZnKey;
  }
}
