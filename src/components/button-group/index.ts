import ZnButtonGroup from './button-group.component';

export * from './button-group.component';
export default ZnButtonGroup;

ZnButtonGroup.define('zn-button-group');

declare global {
  interface HTMLElementTagNameMap {
    'zn-button-group': ZnButtonGroup;
  }
}
