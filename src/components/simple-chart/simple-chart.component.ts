import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { type CSSResultGroup, html, unsafeCSS } from 'lit';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { property } from 'lit/decorators.js';
import styles from './simple-chart.scss';
import ZincElement from '../../internal/zinc-element';
import type { ECharts } from 'echarts/core';

echarts.use([BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

const DEFAULT_LABELS = [
  'Jun 2016', 'Jul 2016', 'Aug 2016', 'Sep 2016', 'Oct 2016', 'Nov 2016',
  'Dec 2016', 'Jan 2017', 'Feb 2017', 'Mar 2017', 'Apr 2017', 'May 2017',
];
const DEFAULT_DATA = [56.4, 39.8, 66.8, 66.4, 40.6, 55.2, 77.4, 69.8, 57.8, 76, 110.8, 142.6];

/**
 * @summary A simple, pre-styled bar chart.
 * @documentation https://zinc.style/components/simple-chart
 * @status experimental
 * @since 1.0
 */
export default class ZnSimpleChart extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({ attribute: 'datasets', type: Array }) datasets?: { data: number[] }[];
  @property({ attribute: 'labels', type: Array }) labels?: string[];

  private chart?: ECharts;
  private resizeObserver?: ResizeObserver;

  firstUpdated() {
    const host = this.shadowRoot?.getElementById('chart') as HTMLElement | null;
    if (!host) return;
    this.chart = echarts.init(host);
    const data = this.datasets?.[0]?.data ?? DEFAULT_DATA;
    const labels = this.labels ?? DEFAULT_LABELS;
    this.chart.setOption({
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderWidth: 0,
        textStyle: { color: '#fff' },
      },
      xAxis: { type: 'category', data: labels, show: false },
      yAxis: { type: 'value', show: false },
      grid: { left: 0, right: 0, top: 0, bottom: 0 },
      series: [{
        type: 'bar',
        data,
        barWidth: 7,
        itemStyle: {
          color: '#29C1BC',
          borderRadius: 10,
        },
        emphasis: {
          itemStyle: { color: '#19837f' },
        },
      }],
    });
    this.resizeObserver = new ResizeObserver(() => this.chart?.resize());
    this.resizeObserver.observe(host);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
    this.chart?.dispose();
  }

  render() {
    return html`<div id="chart"></div>`;
  }
}
