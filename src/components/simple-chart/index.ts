import ZnSimpleChart from './simple-chart.component';

export * from './simple-chart.component';
export default ZnSimpleChart;

ZnSimpleChart.define('zn-simple-chart');

declare global {
  interface HTMLElementTagNameMap {
    'zn-simple-chart': ZnSimpleChart;
  }
}
