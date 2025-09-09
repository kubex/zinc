import ZnBreadcrumb from './breadcrumb.component';

export * from './breadcrumb.component';
export default ZnBreadcrumb;

ZnBreadcrumb.define('zn-breadcrumb');

declare global {
  interface HTMLElementTagNameMap {
    'zn-breadcrumb': ZnBreadcrumb;
  }
}
