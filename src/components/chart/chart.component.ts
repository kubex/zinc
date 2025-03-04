import { property } from 'lit/decorators.js';
import { type CSSResultGroup, html, unsafeCSS } from 'lit';
import ZincElement from '../../internal/zinc-element';
import { Chart, ChartConfiguration, Colors, registerables } from 'chart.js';

import styles from './chart.scss';
import { htmlLegendPlugin } from "./html-legend-plugin";

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/chart
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
export default class ZnChart extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({ attribute: 'data', type: Array, reflect: true }) public data: any[];
  @property({ attribute: 'labels', type: Array, reflect: true }) public labels: any[];
  @property({ attribute: 'type', reflect: true }) public type = 'line';

  constructor() {
    super();
    Chart.register(...registerables);
    Chart.register(Colors);
  }

  static get properties() {
    return {
      Test: { type: String },
      myChart: { type: Object }
    };
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.data === null || this.data === undefined) {
      if (this.childNodes.length > 0 && this.childNodes[0].nodeType === 3) {
        const data = this.childNodes[0];
        try {
          this.data = JSON.parse(data.textContent ?? '');
        } catch (e) { /* empty */
          console.error(e);
        }
      }
    }
  }

  firstUpdated() {
    const ctx = (this.renderRoot.querySelector('#chat') as HTMLCanvasElement).getContext('2d');
    if (!ctx) {
      return;
    }

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

  render() {
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
