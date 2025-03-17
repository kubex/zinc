import ZnListContainer from './list-container.component';

export * from './list-container.component';
export default ZnListContainer;

ZnListContainer.define('zn-list-container');

declare global {
  interface HTMLElementTagNameMap {
    'zn-list-container': ZnListContainer;
  }
}
