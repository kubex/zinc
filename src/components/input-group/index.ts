import ZnInputGroup from './input-group.component';

export * from './input-group.component';
export default ZnInputGroup;

ZnInputGroup.define('zn-input-group');

declare global {
  interface HTMLElementTagNameMap {
    'zn-input-group': ZnInputGroup;
  }
}
