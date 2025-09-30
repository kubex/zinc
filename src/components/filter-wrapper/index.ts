import ZnFilterWrapper from './filter-wrapper.component';

export * from './filter-wrapper.component';
export default ZnFilterWrapper;

ZnFilterWrapper.define('zn-filter-wrapper');

declare global {
  interface HTMLElementTagNameMap {
    'zn-filter-wrapper': ZnFilterWrapper;
  }
}
