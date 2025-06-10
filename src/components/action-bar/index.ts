import ZnActionBar from './action-bar.component';

export * from './action-bar.component';
export default ZnActionBar;

ZnActionBar.define('zn-action-bar');

declare global {
  interface HTMLElementTagNameMap {
    'zn-action-bar': ZnActionBar;
  }
}
