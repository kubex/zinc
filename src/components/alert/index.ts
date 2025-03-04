import ZnAlert from './alert.component';

export * from './alert.component';
export default ZnAlert;

ZnAlert.define('zn-alert');

declare global {
  interface HTMLElementTagNameMap {
    'zn-alert': ZnAlert;
  }
}
