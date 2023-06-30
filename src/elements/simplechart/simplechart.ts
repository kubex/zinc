import {html, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ZincElement} from "../../ts/element";

import styles from './simplechart.scss';
import {Chart, ChartConfiguration, registerables} from "chart.js";

@customElement('zn-simplechart')
export class ZincSimpleChart extends ZincElement {
  static styles = unsafeCSS(styles);
  private myChart: Chart;

  @property({attribute: 'datasets', type: Array}) datasets;
  @property({attribute: 'labels', type: Array}) labels;

  constructor() {
    super();
    Chart.register(...registerables)
  }

  firstUpdated() {
    const ctx = (this.renderRoot.querySelector('#myChart') as HTMLCanvasElement).getContext('2d');

    console.log(this.datasets);

    const config = {
      type: 'bar',
      data: {
        labels: this.labels,
        datasets: this.datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: false,
            external: function (context) {
              // Tooltip Element
              let tooltipEl = document.getElementById("chartjs-tooltip");

              // Create element on first render
              if (!tooltipEl) {
                tooltipEl = document.createElement("div");
                tooltipEl.id = "chartjs-tooltip";
                tooltipEl.innerHTML = "<table></table>";
                document.body.appendChild(tooltipEl);
              }

              // Hide if no tooltip
              const tooltipModel = context.tooltip;
              if (tooltipModel.opacity === 0) {
                tooltipEl.style.opacity = "0";
                return;
              }

              // Set caret Position
              tooltipEl.classList.remove("above", "below", "no-transform");
              if (tooltipModel.yAlign) {
                tooltipEl.classList.add(tooltipModel.yAlign);
              } else {
                tooltipEl.classList.add("no-transform");
              }

              function getBody(bodyItem) {
                return bodyItem.lines;
              }

              // Set Text
              if (tooltipModel.body) {
                const titleLines = tooltipModel.title || [];
                const bodyLines = tooltipModel.body.map(getBody);

                let innerHtml = "<thead>";

                titleLines.forEach(function (title) {
                  innerHtml += "<tr><th>" + title + "</th></tr>";
                });
                innerHtml += "</thead><tbody>";

                bodyLines.forEach(function (body, i) {
                  const colors = tooltipModel.labelColors[i];
                  let style = "background:" + colors.backgroundColor;
                  style += "; border-color:" + colors.borderColor;
                  style += "; border-width: 2px";
                  const span = '<span style="' + style + '"></span>';
                  innerHtml += "<tr><td>" + span + body + "</td></tr>";
                });
                innerHtml += "</tbody>";

                const tableRoot = tooltipEl.querySelector("table");
                tableRoot.innerHTML = innerHtml;
              }

              const position = context.chart.canvas.getBoundingClientRect();
              const bodyFont = Chart.defaults.font;

              tooltipModel.padding = 3;

              // Display, position, and set styles for font
              tooltipEl.style.opacity = "1";
              tooltipEl.style.position = "absolute";
              tooltipEl.style.left =
                position.left +
                window.pageXOffset +
                tooltipModel.caretX +
                5 +
                "px";
              tooltipEl.style.top =
                position.top +
                window.pageYOffset +
                tooltipModel.caretY +
                10 +
                "px";
              tooltipEl.style.font = bodyFont.family;
              tooltipEl.style.color = "white";
              tooltipEl.style.padding = tooltipModel.padding + "px " + tooltipModel.padding + "px";
              tooltipEl.style.pointerEvents = "none";
              tooltipEl.style.background = "rgba(0, 0, 0, 0.7)";
              tooltipEl.style.borderRadius = "10px";
            }
          }
        },
        elements: {
          bar: {
            borderRadius: 10,
            barThickness: 2,
            maxBarThickness: 2,
            backgroundColor: "#29C1BC",
            hoverBackgroundColor: "#19837f",
          }
        },
        scales: {
          x: {
            display: false
          },
          y: {
            display: false
          }
        }
      }
    };

    this.myChart = new Chart(ctx, config as ChartConfiguration);
  }

  render() {
    return html`
      <div>
        <canvas id="myChart"></canvas>
      </div>
    `;
  }
}
