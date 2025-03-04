import ZnPanel from './panel.component';

export * from './panel.component';
export default ZnPanel;

ZnPanel.define('zn-panel');

declare global {
  interface HTMLElementTagNameMap {
    'zn-panel': ZnPanel;
  }
}
