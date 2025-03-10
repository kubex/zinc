import ZnConfirm from './confirm.component';

export * from './confirm.component';
export default ZnConfirm;

ZnConfirm.define('zn-confirm');

declare global {
  interface HTMLElementTagNameMap {
    'zn-confirm-modal': ZnConfirm;
  }
}
