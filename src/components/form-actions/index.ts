import ZnFormActions from './form-actions.component';

export * from './form-actions.component';
export default ZnFormActions;

ZnFormActions.define('zn-form-actions');

declare global {
  interface HTMLElementTagNameMap {
    'zn-form-actions': ZnFormActions;
  }
}
