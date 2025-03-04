import ZnSidebar from './sidebar.component';

export * from './sidebar.component';
export default ZnSidebar;

ZnSidebar.define('zn-sidebar');

declare global {
  interface HTMLElementTagNameMap {
    'zn-sidebar': ZnSidebar;
  }
}
