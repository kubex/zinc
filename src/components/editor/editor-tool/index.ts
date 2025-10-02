import ZnEditorTool from './editor-tool.component';

export * from './editor-tool.component';
export default ZnEditorTool;

ZnEditorTool.define('zn-editor-tool');

declare global {
  interface HTMLElementTagNameMap {
    'zn-editor-tool': ZnEditorTool;
  }
}
