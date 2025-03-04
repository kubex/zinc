import ZnQueryBuilder from './query-builder.component';

export * from './query-builder.component';
export default ZnQueryBuilder;

ZnQueryBuilder.define('zn-query-builder');

declare global {
  interface HTMLElementTagNameMap {
    'zn-query-builder': ZnQueryBuilder;
  }
}
