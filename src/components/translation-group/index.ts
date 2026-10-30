import ZnTranslationGroup from './translation-group.component';

export * from './translation-group.component';
export default ZnTranslationGroup;

ZnTranslationGroup.define('zn-translation-group');

declare global {
  interface HTMLElementTagNameMap {
    'zn-translation-group': ZnTranslationGroup;
  }
}
