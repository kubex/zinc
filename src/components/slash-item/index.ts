import ZnSlashItem from './slash-item.component';

export * from './slash-item.component';
export default ZnSlashItem;

ZnSlashItem.define('zn-slash-item');

declare global {
  interface HTMLElementTagNameMap {
    'zn-slash-item': ZnSlashItem;
  }
}
