import ZnBulkActions from './bulk-actions.component';

export * from './bulk-actions.component';
export default ZnBulkActions;

ZnBulkActions.define('zn-bulk-actions');

declare global {
  interface HTMLElementTagNameMap {
    'zn-bulk-actions': ZnBulkActions;
  }
}
