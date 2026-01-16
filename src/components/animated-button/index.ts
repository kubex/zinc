import ZnAnimatedButton from './animated-button.component';

export * from './animated-button.component';
export default ZnAnimatedButton;

ZnAnimatedButton.define('zn-animated-button');

declare global {
  interface HTMLElementTagNameMap {
    'zn-animated-button': ZnAnimatedButton;
  }
}
