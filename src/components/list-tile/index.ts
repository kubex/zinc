import ZnListTile from './list-tile.component';

export * from './list-tile.component';
export default ZnListTile;

ZnListTile.define('zn-list-tile');

declare global {
  interface HTMLElementTagNameMap {
    'zn-list-tile': ZnListTile;
  }
}
