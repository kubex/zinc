import ZnPage from './page.component';

export * from './page.component';
export default ZnPage;

ZnPage.define('zn-page');

declare global {
  interface HTMLElementTagNameMap {
    'zn-page': ZnPage;
  }
}

