import ZnDataTable from './data-table.component';

export * from './data-table.component';
export default ZnDataTable;

ZnDataTable.define('zn-data-table');

declare global {
  interface HTMLElementTagNameMap {
    'zn-data-table': ZnDataTable;
  }
}
