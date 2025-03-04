import ZnProgressTile from './progress-tile.component';

export * from './progress-tile.component';
export default ZnProgressTile;

ZnProgressTile.define('zn-progress-tile');

declare global {
  interface HTMLElementTagNameMap {
    'zn-progress-tile': ZnProgressTile;
  }
}
