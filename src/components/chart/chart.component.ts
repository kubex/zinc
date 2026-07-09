import {
  buildAreaOption,
  buildBarOption,
  type BuilderProps,
  buildLineOption,
  buildSankeyOption,
  type ChartType,
  type SeriesItem,
} from './builders';
import { type CSSResultGroup, html, type PropertyValues, unsafeCSS } from 'lit';
import { type EChartsModule, loadECharts } from './echarts-loader';
import { property } from 'lit/decorators.js';
import { ResizeController } from '@lit-labs/observers/resize-controller.js';
import styles from './chart.scss';
import ZincElement from '../../internal/zinc-element';
import type { ECharts } from 'echarts/core';

/**
 * @summary Chart component powered by Apache ECharts.
 * @documentation https://zinc.style/components/data-chart
 * @status experimental
 * @since 1.0
 *
 * @csspart base - The component's base wrapper.
 */
export default class ZnChart extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property() type: ChartType = 'bar';
  @property({ type: Array }) data: SeriesItem[] = [];
  @property({ type: Array }) categories: string[] = [];

  @property({ attribute: 'xaxis' }) xAxis: 'datetime' | 'category' | 'numeric';
  @property({ type: Number, attribute: 'd-size' }) datapointSize: number = 1;
  @property({ type: Boolean }) stacked = false;

  @property({ type: Boolean }) live = false;
  @property({ attribute: 'data-url' }) dataUrl = '';
  @property({ attribute: 'live-interval', type: Number }) liveInterval = 1000;
  @property({ type: Number, reflect: true }) height = 300;

  @property({
    attribute: 'enable-animations',
    converter: {
      fromAttribute: (value: string | null) => {
        if (value === null) return false;
        if (value === '' || value === 'true') return true;
        const num = parseFloat(value);
        return Number.isNaN(num) ? true : num;
      },
    },
  }) enableAnimations: boolean | number = false;
  @property({ attribute: 'y-axis-append' }) yAxisAppend: string;

  @property({ type: Array }) colors?: string[];
  @property({ attribute: 'sync-group' }) syncGroup?: string;
  @property({ type: Boolean }) smooth = false;
  @property({
    converter: {
      fromAttribute: (value: string | null) => {
        if (value === null) return false;
        if (value === '' || value === 'true') return true;
        const num = parseFloat(value);
        return Number.isNaN(num) ? true : num;
      },
    },
  }) scale: boolean | number = false;

  private chart?: ECharts;
  private echarts?: EChartsModule;
  private initPromise?: Promise<void>;
  private liveTimer?: number;

  private readonly resizeObserver = new ResizeController(this, {
    target: null,
    skipInitial: true,
    callback: () => this.chart?.resize(),
  });

  protected firstUpdated(_changedProperties: PropertyValues) {
    this.initPromise = this.initChart().catch(() => undefined);
    super.firstUpdated(_changedProperties);
  }

  // Make `await el.updateComplete` cover the lazy echarts load and chart init
  protected override async getUpdateComplete(): Promise<boolean> {
    const result = await super.getUpdateComplete();
    await this.initPromise;
    return result;
  }

  private getTheme(): 'light' | 'dark' {
    return this.getAttribute('t') === 'dark' ? 'dark' : 'light';
  }

  private getTextColor(): string | undefined {
    const cs = getComputedStyle(this);
    const rgb = cs.getPropertyValue('--zn-text').trim();
    if (!rgb) return undefined;
    const opacity = cs.getPropertyValue('--zn-text-opacity').trim() || '1';
    return `rgba(${rgb}, ${opacity})`;
  }

  private getBorderColor(): string | undefined {
    const rgb = getComputedStyle(this).getPropertyValue('--zn-border-color').trim();
    return rgb ? `rgb(${rgb})` : undefined;
  }

  private buildOption() {
    const props: BuilderProps = {
      type: this.type,
      data: this.data ?? [],
      categories: Array.isArray(this.categories) ? this.categories : [],
      xAxisType: this.xAxis,
      yAxisAppend: this.yAxisAppend,
      stacked: this.stacked,
      enableAnimations: this.enableAnimations,
      datapointSize: this.datapointSize,
      colors: this.colors,
      theme: this.getTheme(),
      smooth: this.smooth,
      scale: this.scale,
      textColor: this.getTextColor(),
      borderColor: this.getBorderColor(),
    };
    switch (this.type) {
      case 'bar': return buildBarOption(props);
      case 'line': return buildLineOption(props);
      case 'area': return buildAreaOption(props);
      case 'sankey': return buildSankeyOption(props);
      default: return buildBarOption(props);
    }
  }

  private async initChart() {
    const host = this.shadowRoot?.getElementById('chart') as HTMLElement | null;
    if (!host) return;
    host.style.height = `${this.height}px`;

    const echarts = await loadECharts();
    if (!this.isConnected || this.chart) return;
    this.echarts = echarts;

    this.chart = echarts.init(host);
    this.chart.setOption(this.buildOption());

    if (this.syncGroup) {
      this.chart.group = this.syncGroup;
      echarts.connect(this.syncGroup);
    }

    this.resizeObserver.observe(host);

    if (this.live && this.dataUrl) this.startLive();
  }

  private startLive() {
    this.liveTimer = window.setInterval(async () => {
      try {
        const res = await fetch(this.dataUrl);
        const newData = await res.json() as SeriesItem[];
        this.data = newData;
        this.chart?.setOption({ ...this.buildOption() });
      } catch {
        /* swallow transient fetch errors */
      }
    }, this.liveInterval);
  }

  private reinit() {
    this.chart?.dispose();
    this.chart = undefined;
    this.initPromise = this.initChart().catch(() => undefined);
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null) {
    super.attributeChangedCallback(name, _old, value);
    if (!this.chart) return;

    if (name === 't') { this.reinit(); return; }
    if (name === 'type') { this.reinit(); return; }
    if (name === 'height') {
      const host = this.shadowRoot?.getElementById('chart') as HTMLElement | null;
      if (host) host.style.height = `${this.height}px`;
      this.chart.resize();
      return;
    }
    if (name === 'sync-group') {
      if (value) {
        this.chart.group = value;
        this.echarts?.connect(value);
      } else {
        this.chart.group = '';
      }
      return;
    }
    this.chart.setOption({ ...this.buildOption() });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.liveTimer) clearInterval(this.liveTimer);
    this.chart?.dispose();
    this.chart = undefined;
  }

  protected render(): unknown {
    return html`<div class="chart"><div id="chart"></div></div>`;
  }
}