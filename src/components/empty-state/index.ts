import ZnEmptyState from './empty-state.component';

export * from './empty-state.component';
export default ZnEmptyState;

ZnEmptyState.define('zn-empty-state');

declare global {
  interface HTMLElementTagNameMap {
    'zn-empty-state': ZnEmptyState;
  }
}
