import ZnSplitButton from './split-button.component';

export * from './split-button.component';
export default ZnSplitButton;

ZnSplitButton.define('zn-split-button');

declare global {
  interface HTMLElementTagNameMap {
    'zn-split-button': ZnSplitButton;
  }
}
