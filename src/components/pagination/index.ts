import ZnPagination from './pagination.component';

export * from './pagination.component';
export default ZnPagination;

ZnPagination.define('zn-pagination');

declare global {
  interface HTMLElementTagNameMap {
    'zn-pagination': ZnPagination;
  }
}
