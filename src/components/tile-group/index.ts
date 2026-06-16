import ZnTileGroup from './tile-group.component';

export * from './tile-group.component';
export default ZnTileGroup;

ZnTileGroup.define('zn-tile-group');

declare global {
  interface HTMLElementTagNameMap {
    'zn-tile-group': ZnTileGroup;
  }
}
