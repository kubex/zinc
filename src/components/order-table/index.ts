import ZnOrderTable from './order-table.component';

export * from './order-table.component';
export default ZnOrderTable;

ZnOrderTable.define('zn-order-table');

declare global {
  interface HTMLElementTagNameMap {
    'zn-order-table': ZnOrderTable;
  }
}
