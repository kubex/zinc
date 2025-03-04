import ZnDragUpload from './drag-upload.component';

export * from './drag-upload.component';
export default ZnDragUpload;

ZnDragUpload.define('zn-drag-upload');

declare global {
  interface HTMLElementTagNameMap {
    'zn-drag-upload': ZnDragUpload;
  }
}
