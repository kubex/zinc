import ZnProp from './prop.component';

export * from './prop.component';
export default ZnProp;

ZnProp.define('zn-prop');

declare global {
  interface HTMLElementTagNameMap {
    'zn-prop': ZnProp;
  }
}
