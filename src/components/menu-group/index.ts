import ZnMenuGroup from './menu-group.component';

export * from './menu-group.component';
export default ZnMenuGroup;

ZnMenuGroup.define('zn-menu-group');

declare global {
  interface HTMLElementTagNameMap {
    'zn-menu-group': ZnMenuGroup;
  }
}
