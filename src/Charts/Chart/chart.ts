import {html, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {Chart, ChartConfiguration, Colors, registerables} from 'chart.js';
import {htmlLegendPlugin} from "./HtmlLegendPlugin";
import {ZincElement} from "@/zinc-element";

import styles from './index.scss?inline';

@customElement('zn-chart')
export class ZincChart extends ZincElement
{
  static styles = unsafeCSS(styles);

  @property({attribute: 'data', type: Array, reflect: true}) public data;
  @property({attribute: 'labels', type: Array, reflect: true}) public labels;
  @property({attribute: 'type', type: String, reflect: true}) public type = 'line';

  constructor()
  {
    super();
    Chart.register(...registerables);
    Chart.register(Colors);
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
    if(this.data === null || this.data === undefined)
    {
      if(this.childNodes.length > 0 && this.childNodes[0].nodeType === 3)
      {
        const data = this.childNodes[0];
        try
        {
          this.data = JSON.parse(data.textContent);
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
    const config = {
      type: this.type,
      data: {
        labels: this.labels,
        datasets: this.data
      },
      options: {
        animation: false,
        layout: {
          padding: 20
        },
        elements: {
          point: {
            radius: 3,
          },
          line: {
            borderWidth: 2,
            fill: false,
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
        interaction: {
          intersect: false,
          mode: 'index',
        },
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

    new Chart(ctx, config as ChartConfiguration);
  }

  render()
  {
    return html`
      <div class="chart">
        <div id="legend-container"></div>
        <div class="chart__container">
          <canvas id="chat" style="min-height: 200px;"></canvas>
        </div>
      </div>
    `;
  }
}
