import {
  buildAreaOption,
  buildBarOption,
  type BuilderProps,
  buildFunnelOption,
  buildGaugeOption,
  buildHeatmapOption,
  buildLineOption,
  buildPieOption,
  buildRadarOption,
  buildSankeyOption,
  buildScatterOption,
  buildSunburstOption,
  buildTreemapOption,
  type ChartType,
  type RadarIndicator,
  type SeriesItem,
} from './builders';
import { type CSSResultGroup, html, type PropertyValues, unsafeCSS } from 'lit';
import { type EChartsModule, loadECharts } from './echarts-loader';
import { LiveTransport, LiveWindow } from './live';
import { property, state } from 'lit/decorators.js';
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
  @property({ attribute: 'y-categories', type: Array }) yCategories: string[] = [];
  @property({ type: Array }) indicators: RadarIndicator[] = [];

  @property({ attribute: 'xaxis' }) xAxis: 'datetime' | 'category' | 'numeric';
  @property({ type: Number, attribute: 'd-size' }) datapointSize: number = 1;
  @property({ type: Boolean }) stacked = false;

  @property({ type: Boolean }) live = false;
  @property({ attribute: 'data-url' }) dataUrl = '';
  @property({ attribute: 'stream-url' }) streamUrl = '';
  @property({ attribute: 'live-renew-url' }) liveRenewUrl = '';
  @property({ attribute: 'hide-zero', type: Boolean }) hideZero = false;
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
  @property({ attribute: 'inner-radius' }) innerRadius?: number | string;
  @property({ attribute: 'outer-radius' }) outerRadius?: number | string;
  @property({ attribute: 'show-labels', type: Boolean }) showLabels?: boolean;
  @property({ attribute: 'min-value', type: Number }) minValue?: number;
  @property({ attribute: 'max-value', type: Number }) maxValue?: number;
  /** On line and area charts, marks each series' latest point and hides the rest. */
  @property({ attribute: 'mark-latest', type: Boolean }) markLatest = false;
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
  private pollAbort?: AbortController;
  @state() private liveStatus = 'connecting';
  private liveWindow = new LiveWindow();
  private replaceLiveSeries = true;
  private transport = new LiveTransport((frame, snapshot) => {
    const applied = this.liveWindow.apply(frame, snapshot);
    this.replaceLiveSeries ||= snapshot || applied.prediction !== undefined;
    this.data = this.liveSeries();
    this.requestUpdate();
  }, status => {
    this.liveStatus = status;
    this.dispatchEvent(new CustomEvent('zn-live-status', { detail: { status }, bubbles: true, composed: true }));
  }, serverTime => {
    this.liveWindow.advance(serverTime);
    this.data = this.liveSeries();
  });

  private liveTransitionDuration() {
    if (this.enableAnimations === false || this.enableAnimations === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 0;
    return Math.max(0, Math.min(1000, typeof this.enableAnimations === 'number' ? this.enableAnimations : 350));
  }

  private liveSeries(): SeriesItem[] {
    const duration = this.liveTransitionDuration();
    return this.liveWindow.series(this.hideZero).map(series => ({ ...series,
      animation: duration > 0, animationDuration: 0, animationDurationUpdate: duration,
      animationEasingUpdate: 'linear', animationThreshold: 10000,
    }));
  }

  private updateChart() {
    const option = this.buildOption();
    if (this.liveWindow.frame && this.live && (this.streamUrl || this.liveRenewUrl)) {
      const axis = Array.isArray(option.xAxis) ? option.xAxis[0] : option.xAxis;
      option.xAxis = { ...axis, id: 'live-time', min: this.liveWindow.frame.from, max: this.liveWindow.frame.until };
      const series = this.liveSeries();
      option.legend = { ...option.legend, data: series.filter(s => !s.name.startsWith('_')).map(s => s.name) };
      option.animation = this.liveTransitionDuration() > 0;
      option.animationDuration = 0;
      option.animationDurationUpdate = this.liveTransitionDuration();
      option.animationThreshold = 10000;
      option.animationEasingUpdate = 'linear';
    }
    if (this.liveWindow.frame && this.live && !this.replaceLiveSeries) {
      // Keep the prediction's models and data in ECharts between snapshots.
      // Only measurements and the moving viewport change on deltas/heartbeats.
      const series = Array.isArray(option.series) ? option.series : option.series ? [option.series] : [];
      option.series = series.filter(s => s?.id === 'live-values');
      this.chart?.setOption({
        series: option.series,
        xAxis: { id: 'live-time', min: this.liveWindow.frame.from, max: this.liveWindow.frame.until },
        animation: this.liveTransitionDuration() > 0,
        animationDuration: 0,
        animationDurationUpdate: this.liveTransitionDuration(),
        animationEasingUpdate: 'linear',
        animationThreshold: 10000,
      });
    } else {
      this.chart?.setOption(option, { replaceMerge: ['series', 'legend', 'xAxis'] });
    }
    this.replaceLiveSeries = false;
  }

  protected updated(changed: PropertyValues) {
    super.updated(changed);
    if (!this.chart) return;
    if (['live', 'dataUrl', 'streamUrl', 'liveRenewUrl', 'liveInterval'].some(key => changed.has(key))) this.startLive();
    if (changed.size !== 1 || !changed.has('liveStatus')) this.updateChart();
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.hasUpdated && !this.chart) this.initPromise = this.initChart().catch(() => undefined);
  }

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
    // `m` is the rendered mode; `t` is the theme family. Fall back to `t` for
    // hosts that still only set the legacy `t="dark"`.
    if (this.getAttribute('m') === 'dark') return 'dark';
    if (this.getAttribute('m') === 'light') return 'light';
    return this.getAttribute('t') === 'dark' ? 'dark' : 'light';
  }

  private getTextColor(): string | undefined {
    const cs = getComputedStyle(this);
    const themed = cs.getPropertyValue('--zn-chart-text-color').trim();
    if (themed) return themed;
    const rgb = cs.getPropertyValue('--zn-text').trim();
    if (!rgb) return undefined;
    const opacity = cs.getPropertyValue('--zn-text-opacity').trim() || '1';
    return `rgba(${rgb}, ${opacity})`;
  }

  // A theme supplies a categorical palette as --zn-chart-color-1..6; without
  // one, ECharts keeps its own default palette.
  private getPalette(): string[] | undefined {
    const cs = getComputedStyle(this);
    const colors = [1, 2, 3, 4, 5, 6]
      .map(i => cs.getPropertyValue(`--zn-chart-color-${i}`).trim())
      .filter(Boolean);
    return colors.length ? colors : undefined;
  }

  private getBorderColor(): string | undefined {
    const rgb = getComputedStyle(this).getPropertyValue('--zn-border-color').trim();
    return rgb ? `rgb(${rgb})` : undefined;
  }

  private buildOption() {
    const props: BuilderProps = {
      type: this.type,
      data: this.liveWindow.frame && this.live ? this.liveSeries() : this.data ?? [],
      categories: Array.isArray(this.categories) ? this.categories : [],
      xAxisType: this.xAxis,
      yAxisAppend: this.yAxisAppend,
      stacked: this.stacked,
      enableAnimations: this.enableAnimations,
      datapointSize: this.datapointSize,
      colors: this.colors ?? this.getPalette(),
      theme: this.getTheme(),
      smooth: this.smooth,
      scale: this.scale,
      textColor: this.getTextColor(),
      borderColor: this.getBorderColor(),
      innerRadius: this.innerRadius,
      outerRadius: this.outerRadius,
      showLabels: this.showLabels,
      yCategories: Array.isArray(this.yCategories) ? this.yCategories : [],
      indicators: Array.isArray(this.indicators) ? this.indicators : [],
      minValue: this.minValue,
      maxValue: this.maxValue,
      markLatest: this.markLatest,
    };
    switch (this.type) {
      case 'bar': return buildBarOption(props);
      case 'line': return buildLineOption(props);
      case 'area': return buildAreaOption(props);
      case 'funnel': return buildFunnelOption(props);
      case 'gauge': return buildGaugeOption(props);
      case 'heatmap': return buildHeatmapOption(props);
      case 'donut':
      case 'pie': return buildPieOption(props);
      case 'radar': return buildRadarOption(props);
      case 'sankey': return buildSankeyOption(props);
      case 'scatter': return buildScatterOption(props);
      case 'sunburst': return buildSunburstOption(props);
      case 'treemap': return buildTreemapOption(props);
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

    this.startLive();
  }

  private stopLive() {
    this.transport.stop();
    if (this.liveTimer) clearTimeout(this.liveTimer);
    this.liveTimer = undefined;
    this.pollAbort?.abort();
  }

  private startLive() {
    this.stopLive(); this.liveWindow = new LiveWindow(); this.replaceLiveSeries = true;
    if (!this.live || !this.isConnected) return;
    if (this.streamUrl || this.liveRenewUrl) {
      try { this.transport.start(this.streamUrl, this.liveRenewUrl); } catch { this.stopLive(); }
      return;
    }
    if (!this.dataUrl) return;
    const controller = new AbortController(); this.pollAbort = controller;
    const poll = async () => {
      try {
        const res = await fetch(this.dataUrl, { signal: controller.signal });
        if (res.ok) {
          const data = await res.json() as SeriesItem[];
          if (!controller.signal.aborted) { this.data = data; }
        }
      } catch { /* transient polling failure */ }
      if (!controller.signal.aborted) this.liveTimer = window.setTimeout(() => void poll(), Math.max(250, this.liveInterval));
    };
    this.liveTimer = window.setTimeout(() => void poll(), Math.max(250, this.liveInterval));
  }

  private reinit() {
    this.stopLive();
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
    this.stopLive();
    this.chart?.dispose();
    this.chart = undefined;
  }

  protected render(): unknown {
    return html`<div class="chart"><div id="chart"></div>
      ${this.live && (this.streamUrl || this.liveRenewUrl) ? html`<div role="status" aria-live="polite">Live: ${this.liveStatus}${this.liveWindow.frame ? ` · ${this.liveWindow.frame.resolution_seconds}s intervals · Expected range: ${this.liveWindow.predictionStatus}` : ''}</div>` : ''}
    </div>`;
  }
}
