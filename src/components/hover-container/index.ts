import ZnHoverContainer from './hover-container.component';

export * from './hover-container.component';
export default ZnHoverContainer;

ZnHoverContainer.define('zn-hover-container');

declare global {
  interface HTMLElementTagNameMap {
    'zn-hover-container': ZnHoverContainer;
  }
}
