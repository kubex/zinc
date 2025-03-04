import ZnDefinedLabel from './defined-label.component';

export * from './defined-label.component';
export default ZnDefinedLabel;

ZnDefinedLabel.define('zn-defined-label');

declare global {
  interface HTMLElementTagNameMap {
    'zn-defined-label': ZnDefinedLabel;
  }
}
