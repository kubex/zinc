import ZnDataTableColumns from './data-table-columns.component';

export * from './data-table-columns.component';
export default ZnDataTableColumns;

ZnDataTableColumns.define('zn-data-table-columns');

declare global {
  interface HTMLElementTagNameMap {
    'zn-data-table-columns': ZnDataTableColumns;
  }
}
