import ZnFile from './file.component';

export * from './file.component';
export default ZnFile;

ZnFile.define('zn-file');

declare global {
  interface HTMLElementTagNameMap {
    'zn-file': ZnFile;
  }
}
