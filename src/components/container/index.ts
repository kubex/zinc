import ZnContainer from './container.component';

export * from './container.component';
export default ZnContainer;

ZnContainer.define('zn-container');

declare global {
  interface HTMLElementTagNameMap {
    'zn-container': ZnContainer;
  }
}
