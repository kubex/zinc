import ZnActionItem from './action-item.component';

export * from './action-item.component';
export default ZnActionItem;

ZnActionItem.define('zn-action-item');

declare global {
  interface HTMLElementTagNameMap {
    'zn-action-item': ZnActionItem;
  }
}
