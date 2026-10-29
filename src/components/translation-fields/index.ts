import ZnTranslationFields from './translation-fields.component';

export * from './translation-fields.component';
export default ZnTranslationFields;

ZnTranslationFields.define('zn-translation-fields');

declare global {
  interface HTMLElementTagNameMap {
    'zn-translation-fields': ZnTranslationFields;
  }
}
