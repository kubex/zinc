import ZnPopup from './popup.component';

export * from './popup.component';
export default ZnPopup;

ZnPopup.define('zn-popup');

declare global {
  interface HTMLElementTagNameMap {
    'zn-popup': ZnPopup;
  }
}
