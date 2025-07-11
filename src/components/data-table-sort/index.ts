import ZnDataTableSort from './data-table-sort.component';

export * from './data-table-sort.component';
export default ZnDataTableSort;

ZnDataTableSort.define('zn-data-table-sort');

declare global {
  interface HTMLElementTagNameMap {
    'zn-data-table-sort': ZnDataTableSort;
  }
}
