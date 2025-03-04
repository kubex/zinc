import ZnConfirmModal from './confirm-modal.component';

export * from './confirm-modal.component';
export default ZnConfirmModal;

ZnConfirmModal.define('zn-confirm-modal');

declare global {
  interface HTMLElementTagNameMap {
    'zn-confirm-modal': ZnConfirmModal;
  }
}
