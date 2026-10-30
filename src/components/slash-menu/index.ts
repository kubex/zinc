import ZnSlashMenu from './slash-menu.component';

export * from './slash-menu.component';
export * from './slash-menu-controller';
export * from './slash-menu-items';
export default ZnSlashMenu;

ZnSlashMenu.define('zn-slash-menu');

declare global {
  interface HTMLElementTagNameMap {
    'zn-slash-menu': ZnSlashMenu;
  }
}
