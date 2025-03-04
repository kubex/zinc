import ZnIcon from './icon.component';

export * from './icon.component';
export default ZnIcon;


ZnIcon.define('zn-icon');

declare global {
  interface HTMLElementTagNameMap {
    'zn-icon': ZnIcon;
  }
}
