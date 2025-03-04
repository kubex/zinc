import ZnAccordion from './accordion.component';

export * from './accordion.component';
export default ZnAccordion;

ZnAccordion.define('zn-accordion');

declare global {
  interface HTMLElementTagNameMap {
    'zn-accordion': ZnAccordion;
  }
}
