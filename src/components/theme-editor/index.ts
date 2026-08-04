import ZnThemeEditor from './theme-editor.component';

export * from './theme-editor.component';
export default ZnThemeEditor;

ZnThemeEditor.define('zn-theme-editor');

declare global {
  interface HTMLElementTagNameMap {
    'zn-theme-editor': ZnThemeEditor;
  }
}
