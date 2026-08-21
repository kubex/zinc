import ZnThumbnailGroup from './thumbnail-group.component';

export * from './thumbnail-group.component';
export default ZnThumbnailGroup;

ZnThumbnailGroup.define('zn-thumbnail-group');

declare global {
  interface HTMLElementTagNameMap {
    'zn-thumbnail-group': ZnThumbnailGroup;
  }
}
