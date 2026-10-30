import ZnRemarkdEditor from './remarkd-editor.component';

export * from './remarkd-editor.component';
export default ZnRemarkdEditor;

ZnRemarkdEditor.define('zn-remarkd-editor');

declare global {
  interface HTMLElementTagNameMap {
    'zn-remarkd-editor': ZnRemarkdEditor;
  }
}
