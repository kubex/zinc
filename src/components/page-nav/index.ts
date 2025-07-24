import ZnPageNav from './page-nav.component';

export * from './page-nav.component';
export default ZnPageNav;

ZnPageNav.define('zn-page-nav');

declare global {
  interface HTMLElementTagNameMap {
    'zn-page-nav': ZnPageNav;
  }
}
