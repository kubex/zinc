import ZnEmptyDialog from './empty-dialog.component';

export * from './empty-dialog.component';
export default ZnEmptyDialog;

ZnEmptyDialog.define('zn-empty-dialog');

declare global {
  interface HTMLElementTagNameMap {
    'zn-empty-dialog': ZnEmptyDialog;
  }
}
