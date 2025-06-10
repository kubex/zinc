import ZnDataTableFilter from './data-table-filter.component';

export * from './data-table-filter.component';
export default ZnDataTableFilter;

ZnDataTableFilter.define('zn-data-table-filter');

declare global {
  interface HTMLElementTagNameMap {
    'zn-data-table-filter': ZnDataTableFilter;
  }
}
