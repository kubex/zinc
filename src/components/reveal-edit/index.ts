import ZnRevealEdit from './reveal-edit.component';

export * from './reveal-edit.component';
export default ZnRevealEdit;

ZnRevealEdit.define('zn-reveal-edit');

declare global {
  interface HTMLElementTagNameMap {
    'zn-reveal-edit': ZnRevealEdit;
  }
}
