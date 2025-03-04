import ZnTooltip from './tooltip.component';

export * from './tooltip.component';
export default ZnTooltip;

ZnTooltip.define('zn-tooltip');

declare global {
  interface HTMLElementTagNameMap {
    'zn-tooltip': ZnTooltip;
  }
}
