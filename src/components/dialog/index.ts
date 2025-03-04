import ZnDialog from './dialog.component';

export * from './dialog.component';
export default ZnDialog;

ZnDialog.define('zn-dialog');

declare global {
  interface HTMLElementTagNameMap {
    'zn-dialog': ZnDialog;
  }
}
