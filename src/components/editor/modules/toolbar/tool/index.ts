import ZnEditorTool from './tool.component';

export * from './tool.component';
export default ZnEditorTool;

ZnEditorTool.define('zn-editor-tool');

declare global {
  interface HTMLElementTagNameMap {
    'zn-editor-tool': ZnEditorTool;
  }
}
