import ZnRadioGroup from './radio-group.component';

export * from './radio-group.component';
export default ZnRadioGroup;

ZnRadioGroup.define('zn-radio-group');

declare global {
  interface HTMLElementTagNameMap {
    'zn-radio-group': ZnRadioGroup;
  }
}
