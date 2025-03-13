import ZnDescriptionItem from './description-item.component';

export * from './description-item.component';
export default ZnDescriptionItem;

ZnDescriptionItem.define('zn-description-item');

declare global {
  interface HTMLElementTagNameMap {
    'zn-description-item': ZnDescriptionItem;
  }
}
