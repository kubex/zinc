import { property } from 'lit/decorators.js';
import { type CSSResultGroup, html, unsafeCSS } from 'lit';
import ZincElement from '../../internal/zinc-element';
import ApexCharts from "apexcharts";

import styles from './apex-chart.scss?inline';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/apex-chart
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-example
 *
 * @event zn-event-name - Emitted as an example.
 *
 * @slot - The default slot.
 * @slot example - An example slot.
 *
 * @csspart base - The component's base wrapper.
 *
 * @cssproperty --example - An example CSS custom property.
 */
export default class ZnApexChart extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({ attribute: 'type', type: String, reflect: true }) public type = 'radialBar';
  @property({ attribute: 'amount', type: String, reflect: true }) public amount = '0';

  static get properties() {
    return {
      Test: { type: String },
      myChart: { type: Object }
    };
  }

  firstUpdated() {
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
              formatter: function () {
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
    chart.render();
  }

  render() {
    return html`
      <div class="chart">
        <div class="chart__container">
          <div id="chart"></div>
        </div>
      </div>
    `;
  }
}
