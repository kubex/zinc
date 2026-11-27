import ZnTray from './tray.component';

export * from './tray.component';
export default ZnTray;

ZnTray.define('zn-tray');

declare global {
  interface HTMLElementTagNameMap {
    'zn-tray': ZnTray;
  }
}
