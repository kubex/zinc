import ZnChart from './chart.component';

export * from './chart.component';
export default ZnChart;

ZnChart.define('zn-chart');

declare global {
  interface HTMLElementTagNameMap {
    'zn-chart': ZnChart;
  }
}
