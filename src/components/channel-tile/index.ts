import ZnChannelTile from './channel-tile.component';

export * from './channel-tile.component';
export default ZnChannelTile;

ZnChannelTile.define('zn-channel-tile');

declare global {
  interface HTMLElementTagNameMap {
    'zn-channel-tile': ZnChannelTile;
  }
}
