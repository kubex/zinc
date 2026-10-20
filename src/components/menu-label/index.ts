import ZnMenuLabel from './menu-label.component';

export * from './menu-label.component';
export default ZnMenuLabel;

ZnMenuLabel.define('zn-menu-label');

declare global {
  interface HTMLElementTagNameMap {
    'zn-menu-label': ZnMenuLabel;
  }
}
