import ZnDataChart from './data-chart.component';

export * from './data-chart.component';
export default ZnDataChart;

ZnDataChart.define('zn-data-chart');

declare global {
  interface HTMLElementTagNameMap {
    'zn-data-chart': ZnDataChart;
  }
}
