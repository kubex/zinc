import ZnStyle from './style.component';

export * from './style.component';
export default ZnStyle;

ZnStyle.define('zn-style');

declare global {
  interface HTMLElementTagNameMap {
    'zn-style': ZnStyle;
  }
}
