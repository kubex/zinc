import ZnScrollContainer from './scroll-container.component';

export * from './scroll-container.component';
export default ZnScrollContainer;

ZnScrollContainer.define('zn-scroll-container');

declare global {
  interface HTMLElementTagNameMap {
    'zn-scroll-container': ZnScrollContainer;
  }
}
