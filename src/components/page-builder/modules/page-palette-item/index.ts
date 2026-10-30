import ZnPagePaletteItem from './page-palette-item.component';

export * from './page-palette-item.component';
export default ZnPagePaletteItem;

ZnPagePaletteItem.define('zn-page-palette-item');

declare global {
  interface HTMLElementTagNameMap {
    'zn-page-palette-item': ZnPagePaletteItem;
  }
}
