import ZnTable from './table.component';

export * from './table.component';
export default ZnTable;

ZnTable.define('zn-table');

declare global {
  interface HTMLElementTagNameMap {
    'zn-table': ZnTable;
  }
}
