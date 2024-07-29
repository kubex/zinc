import {html, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ZincElement} from "@/zinc-element";

import styles from './index.scss?inline';
import ApexCharts from "apexcharts";

@customElement('zn-apex-chart')
export class ApexChart extends ZincElement
{
  static styles = unsafeCSS(styles);

  @property({attribute: 'type', type: String, reflect: true}) public type = 'radialBar';
  @property({attribute: 'amount', type: String, reflect: true}) public amount = '0';

  static get properties()
  {
    return {
      Test: {type: String},
      myChart: {type: Object}
    };
  }

  firstUpdated()
  {
    const config = {
      chart: {
        type: this.type,
        height: '100%'
      },
      series: [this.amount],
      plotOptions: {
        radialBar: {
          startAngle: -135,
          endAngle: 135,
          dataLabels: {
            name: {
              fontSize: '0',
              color: undefined,
              offsetY: 0
            },
            value: {
              offsetY: 0,
              fontSize: '0',
              color: undefined,
              formatter: function ()
              {
                return '';
              }
            }
          }
        }
      },
      colors: ['#5932c8'],
      stroke: {
        dashArray: 4
      },
      grid: {
        padding: {
          top: 0,
          bottom: -25,
          right: -10,
          left: -10
        },
      },
      labels: ['']
    };

    const chart = new ApexCharts(this.renderRoot.querySelector('#chart'), config);
    chart.render().then(r => console.log(r));
  }

  render()
  {
    return html`
      <div class="chart">
        <div class="chart__container">
          <div id="chart"></div>
        </div>
      </div>
    `;
  }
}
