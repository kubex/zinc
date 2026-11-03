import ZnDiffRow from './diff-row.component';

export * from './diff-row.component';
export default ZnDiffRow;

ZnDiffRow.define('zn-diff-row');

declare global {
  interface HTMLElementTagNameMap {
    'zn-diff-row': ZnDiffRow;
  }
}
