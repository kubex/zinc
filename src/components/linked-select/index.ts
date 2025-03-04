import ZnLinkedSelect from './linked-select.component';

export * from './linked-select.component';
export default ZnLinkedSelect;

ZnLinkedSelect.define('zn-linked-select');

declare global {
  interface HTMLElementTagNameMap {
    'zn-linked-select': ZnLinkedSelect;
  }
}
