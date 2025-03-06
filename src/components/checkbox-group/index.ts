import ZnCheckboxGroup from './checkbox-group.component';

export * from './checkbox-group.component';
export default ZnCheckboxGroup;

ZnCheckboxGroup.define('zn-checkbox-group');

declare global {
  interface HTMLElementTagNameMap {
    'zn-checkbox-group': ZnCheckboxGroup;
  }
}
