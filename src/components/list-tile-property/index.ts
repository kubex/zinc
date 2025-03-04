import ZnListTileProperty from './list-tile-property.component';

export * from './list-tile-property.component';
export default ZnListTileProperty;

ZnListTileProperty.define('zn-list-tile-property');

declare global {
  interface HTMLElementTagNameMap {
    'zn-list-tile-property': ZnListTileProperty;
  }
}
