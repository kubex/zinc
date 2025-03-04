import ZnMenuItem from './menu-item.component';

export * from './menu-item.component';
export default ZnMenuItem;

ZnMenuItem.define('zn-menu-item');

declare global {
  interface HTMLElementTagNameMap {
    'zn-menu-item': ZnMenuItem;
  }
}
