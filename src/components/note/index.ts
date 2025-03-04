import ZnNote from './note.component';

export * from './note.component';
export default ZnNote;

ZnNote.define('zn-note');

declare global {
  interface HTMLElementTagNameMap {
    'zn-note': ZnNote;
  }
}
