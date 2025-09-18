import ZnEditorToolbar from "./editor-toolbar.component";

export * from './editor-toolbar.component';
export default ZnEditorToolbar;

ZnEditorToolbar.define('zn-editor-toolbar');

declare global {
  interface HTMLElementTagNameMap {
    'zn-editor-toolbar': ZnEditorToolbar;
  }
}
