import ZnMenu from './menu.component';

export * from './menu.component';
export default ZnMenu;

ZnMenu.define('zn-menu');

declare global {
  interface HTMLElementTagNameMap {
    'zn-menu': ZnMenu;
  }
}
