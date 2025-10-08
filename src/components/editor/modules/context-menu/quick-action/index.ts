import ZnEditorQuickAction from './quick-action.component';

export * from './quick-action.component';
export default ZnEditorQuickAction;

ZnEditorQuickAction.define('zn-editor-quick-action');

declare global {
  interface HTMLElementTagNameMap {
    'zn-editor-quick-action': ZnEditorQuickAction;
  }
}
