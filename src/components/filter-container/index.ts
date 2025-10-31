import ZnFilterContainer from './filter-container.component';

export * from './filter-container.component';
export default ZnFilterContainer;

ZnFilterContainer.define('zn-filter-container');

declare global {
  interface HTMLElementTagNameMap {
    'zn-filter-container': ZnFilterContainer;
  }
}
