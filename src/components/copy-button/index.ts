import ZnCopyButton from './copy-button.component';

export * from './copy-button.component';
export default ZnCopyButton;

ZnCopyButton.define('zn-copy-button');

declare global {
  interface HTMLElementTagNameMap {
    'zn-copy-button': ZnCopyButton;
  }
}
