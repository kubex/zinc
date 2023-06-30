import {html, unsafeCSS} from 'lit';
import {customElement} from 'lit/decorators.js';
import {ZincElement} from "../../ts/element";
import {Chart, registerables} from 'chart.js'
import {htmlLegendPlugin} from "./HtmlLegendPlugin";

import styles from './chart.scss';

@customElement('zn-chart')
export class ZincChip extends ZincElement {
  static styles = unsafeCSS(styles);
  private myChart: any;

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

    const config = {
      type: 'line',
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            data: [
              {x: "Mon", y: 20000},
              {x: "Tue", y: 20400},
              {x: "Wed", y: 19000},
              {x: "Thu", y: 18700},
              {x: "Fri", y: 18942},
              {x: "Sat", y: 19243},
              {x: "Sun", y: 19400},
            ],
          }
        ]
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
            backgroundColor: 'rgba(60, 216, 187, 0.1)',
            fill: true,
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

    // @ts-ignore
    this.myChart = new Chart(ctx, config);
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
