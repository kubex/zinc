import ZnNavList from './nav-list.component';

export * from './nav-list.component';
export default ZnNavList;

ZnNavList.define('zn-nav-list');

declare global {
  interface HTMLElementTagNameMap {
    'zn-nav-list': ZnNavList;
  }
}
