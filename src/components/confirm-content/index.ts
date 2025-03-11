import ZnConfirmContent from './confirm-content.component';

export * from './confirm-content.component';
export default ZnConfirmContent;

ZnConfirmContent.define('zn-confirm-content');

declare global {
  interface HTMLElementTagNameMap {
    'zn-confirm-content': ZnConfirmContent;
  }
}
