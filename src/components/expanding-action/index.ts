import ZnExpandingAction from './expanding-action.component';

export * from './expanding-action.component';
export default ZnExpandingAction;

ZnExpandingAction.define('zn-expanding-action');

declare global {
  interface HTMLElementTagNameMap {
    'zn-expanding-action': ZnExpandingAction;
  }
}
