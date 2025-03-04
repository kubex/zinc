import ZnProgressBar from './progress-bar.component';

export * from './progress-bar.component';
export default ZnProgressBar;

ZnProgressBar.define('zn-progress-bar');

declare global {
  interface HTMLElementTagNameMap {
    'zn-progress-bar': ZnProgressBar;
  }
}
