import ZnFilterTray from './filter-tray.component';

export * from './filter-tray.component';
export default ZnFilterTray;

ZnFilterTray.define('zn-filter-tray');

declare global {
  interface HTMLElementTagNameMap {
    'zn-filter-tray': ZnFilterTray;
  }
}
