import ZnChartSwitcher from './chart-switcher.component';

export * from './chart-switcher.component';
export default ZnChartSwitcher;

ZnChartSwitcher.define('zn-chart-switcher');

declare global {
  interface HTMLElementTagNameMap {
    'zn-chart-switcher': ZnChartSwitcher;
  }
}
