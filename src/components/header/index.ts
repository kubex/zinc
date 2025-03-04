import ZnHeader from './header.component';

export * from './header.component';
export default ZnHeader;

ZnHeader.define('zn-header');

declare global {
  interface HTMLElementTagNameMap {
    'zn-header': ZnHeader;
  }
}
