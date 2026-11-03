import ZnDiff from './diff.component';

export * from './diff.component';
export default ZnDiff;

ZnDiff.define('zn-diff');

declare global {
  interface HTMLElementTagNameMap {
    'zn-diff': ZnDiff;
  }
}
