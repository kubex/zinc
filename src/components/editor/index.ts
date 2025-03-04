import ZnEditor from './editor.component';

export * from './editor.component';
export default ZnEditor;

ZnEditor.define('zn-editor');

declare global {
  interface HTMLElementTagNameMap {
    'zn-editor': ZnEditor;
  }
}
