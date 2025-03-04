import ZnSplitPane from './split-pane.component';

export * from './split-pane.component';
export default ZnSplitPane;

ZnSplitPane.define('zn-split-pane');

declare global {
  interface HTMLElementTagNameMap {
    'zn-split-pane': ZnSplitPane;
  }
}
