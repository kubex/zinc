import ZnDataTableSearch from './data-table-search.component';

export * from './data-table-search.component';
export default ZnDataTableSearch;

ZnDataTableSearch.define('zn-data-table-search');

declare global {
  interface HTMLElementTagNameMap {
    'zn-data-table-search': ZnDataTableSearch;
  }
}
