import ZnItem from './item.component';

export * from './item.component';
export default ZnItem;

ZnItem.define('zn-item');

declare global {
  interface HTMLElementTagNameMap {
    'zn-item': ZnItem;
  }
}
