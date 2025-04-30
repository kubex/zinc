import ZnButtonMenu from './button-menu.component';

export * from './button-menu.component';
export default ZnButtonMenu;

ZnButtonMenu.define('zn-button-menu');

declare global {
  interface HTMLElementTagNameMap {
    'zn-button-menu': ZnButtonMenu;
  }
}
