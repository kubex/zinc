import ZnAbsoluteContainer from './absolute-container.component';

export * from './absolute-container.component';
export default ZnAbsoluteContainer;

ZnAbsoluteContainer.define('zn-absolute-container');

declare global {
  interface HTMLElementTagNameMap {
    'zn-absolute-container': ZnAbsoluteContainer;
  }
}
