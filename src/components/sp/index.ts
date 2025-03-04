import ZnSp from './sp.component';

export * from './sp.component';
export default ZnSp;

ZnSp.define('zn-sp');

declare global {
  interface HTMLElementTagNameMap {
    'zn-sp': ZnSp;
  }
}
