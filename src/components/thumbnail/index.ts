import ZnThumbnail from './thumbnail.component';

export * from './thumbnail.component';
export default ZnThumbnail;

ZnThumbnail.define('zn-thumbnail');

declare global {
  interface HTMLElementTagNameMap {
    'zn-thumbnail': ZnThumbnail;
  }
}
