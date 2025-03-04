import ZnToggle from './toggle.component';

export * from './toggle.component';
export default ZnToggle;

ZnToggle.define('zn-toggle');

declare global {
  interface HTMLElementTagNameMap {
    'zn-toggle': ZnToggle;
  }
}
