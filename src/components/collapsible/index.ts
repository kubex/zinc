import ZnCollapsible from './collapsible.component';

export * from './collapsible.component';
export default ZnCollapsible;

ZnCollapsible.define('zn-collapsible');

declare global {
  interface HTMLElementTagNameMap {
    'zn-collapsible': ZnCollapsible;
  }
}
