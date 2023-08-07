import {html, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {Chart, ChartConfiguration, registerables} from 'chart.js'
import {htmlLegendPlugin} from "./HtmlLegendPlugin";
import {ZincElement} from "../zinc";

import styles from './index.scss';

@customElement('zn-chart')
export class ZincChart extends ZincElement {
  static styles = unsafeCSS(styles);
  private myChart: Chart;

  @property({attribute: 'datasets', type: Array, reflect: true}) public datasets;
  @property({attribute: 'labels', type: Array, reflect: true}) public labels;
  @property({attribute: 'type', type: String, reflect: true}) public type = 'line';

  constructor() {
    super();
    Chart.register(...registerables)
  }

  static get properties() {
    return {
      Test: {type: String},
      myChart: {type: Object}
    };
  }

  firstUpdated() {
    const ctx = (this.renderRoot.querySelector('#myChart2') as HTMLCanvasElement).getContext('2d');
    console.log(this.datasets);

    const drawBackground = this.datasets.length <= 1;
    const config = {
      type: this.type,
      data: {
        labels: this.labels,
        datasets: this.datasets
      },
      options: {
        layout: {
          padding: 20
        },
        elements: {
          point: {
            radius: 6,
            backgroundColor: 'rgb(60, 216, 187)',
            borderColor: 'rgb(60, 216, 187)',
          },
          line: {
            borderWidth: 3,
            borderColor: 'rgb(60, 216, 187)',
            backgroundColor: drawBackground ? 'rgba(60, 216, 187, 0.1)' : 'rgba(0, 0, 0, 0)',
            fill: drawBackground,
          }
        },
        scales: {
          y: {
            type: 'linear',
            grid: {
              offset: true,
            }
          },
          x: {
            grid: {
              display: false
            },
          },
        },
        maintainAspectRatio: false,
        plugins: {
          htmlLegend: {
            containerID: 'legend-container',
          },
          legend: {
            display: false,
          }
        }
      },
      plugins: [htmlLegendPlugin]
    };

    this.myChart = new Chart(ctx, config as ChartConfiguration);
  }

  render() {
    return html`
      <div>
        <div id="legend-container"></div>
        <div>
          <canvas id="myChart2" width="400" height="400"></canvas>
        </div>
      </div>
    `;
  }
}
