import ZnPreviewFrame from './preview-frame.component';

export * from './preview-frame.component';
export default ZnPreviewFrame;

ZnPreviewFrame.define('zn-preview-frame');

declare global {
  interface HTMLElementTagNameMap {
    'zn-preview-frame': ZnPreviewFrame;
  }
}
