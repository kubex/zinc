import ZnStatusIndicator from './status-indicator.component';

export * from './status-indicator.component';
export default ZnStatusIndicator;

ZnStatusIndicator.define('zn-status-indicator');

declare global {
  interface HTMLElementTagNameMap {
    'zn-status-indicator': ZnStatusIndicator;
  }
}
