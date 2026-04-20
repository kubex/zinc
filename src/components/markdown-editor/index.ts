import ZnMarkdownEditor from './markdown-editor.component';

export * from './markdown-editor.component';
export default ZnMarkdownEditor;

ZnMarkdownEditor.define('zn-markdown-editor');

declare global {
  interface HTMLElementTagNameMap {
    'zn-markdown-editor': ZnMarkdownEditor;
  }
}
