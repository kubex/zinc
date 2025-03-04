import ZnCols from './cols.component';

export * from './cols.component';
export default ZnCols;

ZnCols.define('zn-cols'); //

declare global {
  interface HTMLElementTagNameMap {
    'zn-cols': ZnCols;
  }
}
