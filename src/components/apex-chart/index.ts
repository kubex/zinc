import ZnApexChart from './apex-chart.component';

export * from './apex-chart.component';
export default ZnApexChart;

ZnApexChart.define('zn-apex-chart');

declare global {
  interface HTMLElementTagNameMap {
    'zn-apex-chart': ZnApexChart;
  }
}
