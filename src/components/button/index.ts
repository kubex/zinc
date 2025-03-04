import ZnButton from './button.component';

export * from './button.component';
export default ZnButton;

ZnButton.define('zn-button');

declare global {
  interface HTMLElementTagNameMap {
    'zn-button': ZnButton;
  }
}
