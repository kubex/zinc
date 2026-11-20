import ZnTypewriter from './typewriter.component';

export * from './typewriter.component';
export default ZnTypewriter;

ZnTypewriter.define('zn-typewriter');

declare global {
  interface HTMLElementTagNameMap {
    'zn-typewriter': ZnTypewriter;
  }
}
