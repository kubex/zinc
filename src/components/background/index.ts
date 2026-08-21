import ZnBackground from './background.component';

export * from './background.component';
export default ZnBackground;

ZnBackground.define('zn-background');

declare global {
  interface HTMLElementTagNameMap {
    'zn-background': ZnBackground;
  }
}
