import ZnTileProperty from './tile-property.component';

export * from './tile-property.component';
export default ZnTileProperty;

ZnTileProperty.define('zn-tile-property');

declare global {
  interface HTMLElementTagNameMap {
    'zn-tile-property': ZnTileProperty;
  }
}
