import ZnTabs from './tabs.component';

export * from './tabs.component';
export default ZnTabs;

ZnTabs.define('zn-tabs');

declare global {
  interface HTMLElementTagNameMap {
    'zn-tabs': ZnTabs;
  }
}
