import {html, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {Chart, ChartConfiguration, registerables} from 'chart.js';
import {htmlLegendPlugin} from "./HtmlLegendPlugin";
import {ZincElement} from "../zinc-element";

import styles from './index.scss?inline';

@customElement('zn-chart')
export class ZincChart extends ZincElement
{
  static styles = unsafeCSS(styles);
  private produced: Chart;

  @property({attribute: 'datasets', type: Array, reflect: true}) public datasets;
  @property({attribute: 'labels', type: Array, reflect: true}) public labels;
  @property({attribute: 'type', type: String, reflect: true}) public type = 'line';

  constructor()
  {
    super();
    Chart.register(...registerables);
  }

  static get properties()
  {
    return {
      Test: {type: String},
      myChart: {type: Object}
    };
  }

  connectedCallback()
  {
    super.connectedCallback();
    if(this.datasets === null || this.datasets === undefined)
    {
      if(this.childNodes.length > 0 && this.childNodes[0].nodeType === 3)
      {
        const data = this.childNodes[0];
        try
        {
          this.datasets = JSON.parse(data.textContent);
        }
        catch(e)
        { /* empty */
          console.error(e);
        }
      }
    }
  }

  firstUpdated()
  {
    const ctx = (this.renderRoot.querySelector('#chat') as HTMLCanvasElement).getContext('2d');
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
            backgroundColor: drawBackground ? 'rgba(60, 216, 187, 0.2)' : 'rgba(0, 0, 0, 0)',
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

    this.produced = new Chart(ctx, config as ChartConfiguration);
  }

  render()
  {
    return html`
      <div>
        <div id="legend-container"></div>
        <div>
          <canvas id="chat" style="min-height: 200px;"></canvas>
        </div>
      </div>
    `;
  }
}
