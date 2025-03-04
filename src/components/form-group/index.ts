import ZnFormGroup from './form-group.component';

export * from './form-group.component';
export default ZnFormGroup;

ZnFormGroup.define('zn-form-group');

declare global {
  interface HTMLElementTagNameMap {
    'zn-form-group': ZnFormGroup;
  }
}
