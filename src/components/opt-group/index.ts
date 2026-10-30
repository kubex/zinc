import ZnOptGroup from './opt-group.component';

export * from './opt-group.component';
export default ZnOptGroup;

ZnOptGroup.define('zn-opt-group');

declare global {
  interface HTMLElementTagNameMap {
    'zn-opt-group': ZnOptGroup;
  }
}
