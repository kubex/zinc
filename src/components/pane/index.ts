import ZnPane from './pane.component';

export * from './pane.component';
export default ZnPane;

ZnPane.define('zn-pane');

declare global {
  interface HTMLElementTagNameMap {
    'zn-pane': ZnPane;
  }
}
