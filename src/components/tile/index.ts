import ZnTile from './tile.component';

export * from './tile.component';
export default ZnTile;

ZnTile.define('zn-tile');

declare global {
  interface HTMLElementTagNameMap {
    'zn-tile': ZnTile;
  }
}
