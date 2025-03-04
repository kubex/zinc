import ZnInlineEdit from './inline-edit.component';

export * from './inline-edit.component';
export default ZnInlineEdit;

ZnInlineEdit.define('zn-inline-edit');

declare global {
  interface HTMLElementTagNameMap {
    'zn-inline-edit': ZnInlineEdit;
  }
}
