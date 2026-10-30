import ZnTranslationField from './translation-field.component';

export * from './translation-field.component';
export default ZnTranslationField;

ZnTranslationField.define('zn-translation-field');

declare global {
  interface HTMLElementTagNameMap {
    'zn-translation-field': ZnTranslationField;
  }
}
