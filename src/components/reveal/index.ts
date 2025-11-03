import ZnReveal from './reveal.component';

export * from './reveal.component';
export default ZnReveal;

ZnReveal.define('zn-reveal');

declare global {
  interface HTMLElementTagNameMap {
    'zn-reveal': ZnReveal;
  }
}
