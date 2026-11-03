import ZnNavItem from './nav-item.component';

export * from './nav-item.component';
export default ZnNavItem;

ZnNavItem.define('zn-nav-item');

declare global {
  interface HTMLElementTagNameMap {
    'zn-nav-item': ZnNavItem;
  }
}
