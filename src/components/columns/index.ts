import ZnColumns from './columns.component';

export * from './columns.component';
export default ZnColumns;

ZnColumns.define('zn-columns');

declare global {
  interface HTMLElementTagNameMap {
    'zn-columns': ZnColumns;
  }
}
