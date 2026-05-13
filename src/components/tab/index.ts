import ZnTab from './tab.component';

export * from './tab.component';
export default ZnTab;

ZnTab.define('zn-tab');

declare global {
  interface HTMLElementTagNameMap {
    'zn-tab': ZnTab;
  }
}

