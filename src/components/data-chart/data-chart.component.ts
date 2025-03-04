import { property } from 'lit/decorators.js';
import { type CSSResultGroup, html, PropertyValues, unsafeCSS } from 'lit';
import ZincElement from '../../internal/zinc-element';
import ApexCharts from "apexcharts";

import styles from './data-chart.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/data-chart
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
export default class ZnDataChart extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property() type: 'area' | 'bar' | 'line' = 'bar';
  @property({ type: Array }) data: any[] = [];
  @property({ type: Array }) categories: string | string[] = '';

  @property() xAxis: string;
  @property({ type: Number, attribute: 'd-size' }) datapointSize: number = 1;

  // Live
  @property({ type: Boolean }) live = false;
  @property({ attribute: 'data-url' }) dataUrl = '';
  @property({ attribute: 'live-interval', type: Number }) liveInterval = 1000;
  @property({ type: Number, reflect: true }) height = 300;

  @property({ attribute: 'enable-animations', type: Boolean }) enableAnimations = false;

  @property({ attribute: 'y-axis-append' }) yAxisAppend: string;

  private chart: ApexCharts;

  // private lightColors = ["#8967ef", "#6483F2", "#29bab5", "#3F51B5", "#9C27B0", "#ff6c9c", "#6836F5", "#47D6D6"];
  // private darkColors = ["#703cff", "#3b65fb", "#07e3db", "#5c75ff", "#e12cff", "#ff125f", "#ae90ff", "#a6ff9c"];

  protected firstUpdated(_changedProperties: PropertyValues) {
    const theme = this.getAttribute('t') || 'light';
    // Setup Chart and render it
    const options = {
      animations: this.enableAnimations,
      chart: {
        type: this.type,
        toolbar: { show: false },
        foreColor: theme == 'dark' ? "rgb(149, 163, 184)" : "rgb(123, 112, 151)",
        height: this.height + 'px',
        fontFamily: '"Inter", sans',
        zoom: {
          enabled: false
        },
        animations: {
          enabled: false,
        },
        events: {}
      },
      dataLabels: {
        enabled: false,
      },
      markers: {
        size: this.datapointSize,
        strokeWidth: 0,
        hover: {
          sizeOffset: 2
        },
      },
      yaxis: {
        labels: {
          formatter: (value: any) => {
            if (this.yAxisAppend) {
              return value + this.yAxisAppend;
            }
            return value;
          }
        }
      },
      tooltip: {
        theme: theme,
        y: {
          formatter: (value: any, _: any) => {
            if (this.yAxisAppend) {
              return value + this.yAxisAppend;
            }
            return value;
          }
        }
      },
      grid: {
        borderColor: theme === 'dark' ? "rgb(50, 50, 60)" : 'rgb(224, 221, 233)',
      },
      //colors: theme === 'dark' ? this.darkColors : this.lightColors,
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        fontSize: '12px',
        fontFamily: '"Inter", sans',
        fontWeight: 400,
        labels: {
          colors: theme == 'dark' ? "rgb(149, 163, 184)" : "rgb(123, 112, 151)",
        },
        markers: {
          shape: 'circle',
        },
      },
      stroke: {
        width: 1.5
      },
      fill: {
        type: 'solid',
        opacity: this.type === 'area' ? 0.1 : .8
      },
      series: this.data,
      xaxis: {},
    };

    if (this.xAxis) {
      options.xaxis = {
        type: this.xAxis,
      };
    } else {
      options.xaxis = {
        categories: this.categories,
      };
    }

    if (this.live) {
      options.chart.animations = {
        enabled: true,
        // @ts-expect-error this is available. it lies.
        easing: 'linear',
        dynamicAnimation: {
          speed: 400
        }
      };

      options.chart.events = {
        animationEnd: function (chartCtx: any, opts: any) {
          const newData1 = chartCtx.w.config.series[0].data.slice();
          newData1.shift();
          const newData2 = chartCtx.w.config.series[1].data.slice();
          newData2.shift();

          // check animation end event for just 1 series to avoid multiple updates
          if (opts.el.node.getAttribute('index') === '0') {
            window.setTimeout(function () {
              chartCtx.updateOptions({
                series: [{
                  data: newData1
                }, {
                  data: newData2
                }],
              }, false, false);
            }, 300);
          }

        }
      };
    }

    if (!this.chart) {
      this.chart = new ApexCharts(this.shadowRoot?.getElementById('chart'), options);
      this.chart.render();
    }


    super.firstUpdated(_changedProperties);
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null) {
    if (this.chart && name === 't') {
      this.chart.updateOptions({
        // colors: value === 'dark' ? this.darkColors : this.lightColors
      });
    }

    if (this.chart && name === 'height') {
      this.chart.updateOptions({
        chart: {
          height: value + 'px'
        }
      });
    }

    super.attributeChangedCallback(name, _old, value);
  }

  protected render(): unknown {
    return html`
      <div class="data-chart">
        <div id="chart"></div>
      </div>
    `;
  }
}
