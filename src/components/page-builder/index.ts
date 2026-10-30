import ZnPageBuilder from './page-builder.component';

export * from './page-builder.component';
export * from './page.types';
export * from './page-registry';
export default ZnPageBuilder;

ZnPageBuilder.define('zn-page-builder');

declare global {
  interface HTMLElementTagNameMap {
    'zn-page-builder': ZnPageBuilder;
  }
}
