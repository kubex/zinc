import ZnInteractionTile from './interaction-tile.component';

export * from './interaction-tile.component';
export default ZnInteractionTile;

ZnInteractionTile.define('zn-interaction-tile');

declare global {
  interface HTMLElementTagNameMap {
    'zn-interaction-tile': ZnInteractionTile;
  }
}
