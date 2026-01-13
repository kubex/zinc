import ZnKeyContainer from './key-container.component';

export * from './key-container.component';
export default ZnKeyContainer;

ZnKeyContainer.define('zn-key-container');

declare global {
  interface HTMLElementTagNameMap {
    'zn-key-container': ZnKeyContainer;
  }
}
