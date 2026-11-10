import ZnContextMenu from './context-menu.component';

export * from './context-menu.component';
export default ZnContextMenu;

ZnContextMenu.define('zn-context-menu');

declare global {
  interface HTMLElementTagNameMap {
    'zn-context-menu': ZnContextMenu;
  }
}
