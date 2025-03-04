import ZnDropdown from './dropdown.component';

export * from './dropdown.component';
export default ZnDropdown;

ZnDropdown.define('zn-dropdown');

declare global {
  interface HTMLElementTagNameMap {
    'zn-dropdown': ZnDropdown;
  }
}
