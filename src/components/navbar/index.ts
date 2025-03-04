import ZnNavbar from './navbar.component';

export * from './navbar.component';
export default ZnNavbar;

ZnNavbar.define('zn-navbar');

declare global {
  interface HTMLElementTagNameMap {
    'zn-navbar': ZnNavbar;
  }
}
