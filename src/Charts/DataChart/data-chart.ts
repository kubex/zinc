import {EmptyZincFormElement} from "@/empty-zinc-form-element";
import {html} from "lit";
import {customElement, property} from "lit/decorators.js";
import ApexCharts from 'apexcharts';
import {PropertyValues} from "@lit/reactive-element";

type ChartType = 'area' | 'bar' | 'line'

@customElement('zn-data-chart')
export class DataChart extends EmptyZincFormElement
{
  @property() type: ChartType = 'bar';
  @property({type: Array}) data: any[] = [];
  @property({type: Array}) categories: string | string[] = '';

  private chart: ApexCharts;

  protected firstUpdated(_changedProperties: PropertyValues)
  {
    // Setup Chart and render it
    const options = {
      chart: {
        type: this.type,
        toolbar: {show: false},
        height: '250px',
        fontFamily: '"Inter", sans',
      },
      dataLabels: {
        enabled: false
      },
      markers: {
        size: 5,
        strokeWidth: 0,
        hover: {
          sizeOffset: 2
        }
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        fontSize: '12px',
        fontFamily: '"Inter", sans',
        fontWeight: 400,
        labels: {
          colors: '#72619F',
        },
        markers: {
          size: 10,
          shape: 'circle',
        },
      },
      stroke: {
        width: 3
      },
      fill: {
        type: 'solid',
        opacity: this.type === 'area' ? 0.1 : .8
      },
      series: this.data,
      xaxis: {
        categories: this.categories
      }
    };

    if(!this.chart)
    {
      this.chart = new ApexCharts(this.shadowRoot?.getElementById('chart'), options);
      this.chart.render();
    }

    super.firstUpdated(_changedProperties);
  }

  protected render(): unknown
  {
    return html`
      <div id="chart"></div>
    `;
  }
}
