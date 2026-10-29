import ZnTranslationGrid from './translation-grid.component';

export * from './translation-grid.component';
export default ZnTranslationGrid;

ZnTranslationGrid.define('zn-translation-grid');

declare global {
  interface HTMLElementTagNameMap {
    'zn-translation-grid': ZnTranslationGrid;
  }
}
