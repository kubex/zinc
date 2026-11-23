import ZnMessageItem from './message-item.component';

export * from './message-item.component';
export default ZnMessageItem;

ZnMessageItem.define('zn-message-item');

declare global {
  interface HTMLElementTagNameMap {
    'zn-message-item': ZnMessageItem;
  }
}
