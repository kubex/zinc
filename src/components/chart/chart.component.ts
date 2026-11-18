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
  formatValue,
  type RadarIndicator,
  type SeriesItem,
} from './builders';
import { classMap } from 'lit/directives/class-map.js';
import { type CSSResultGroup, html, type PropertyValues, unsafeCSS } from 'lit';
import { type EChartsModule, loadECharts } from './echarts-loader';
import { LiveTransport, LiveWindow } from './live';
import { property, state } from 'lit/decorators.js';
import { ResizeController } from '@lit-labs/observers/resize-controller.js';
import { styleMap } from 'lit/directives/style-map.js';
import styles from './chart.scss';
import ZincElement from '../../internal/zinc-element';
import ZnTooltip from '../tooltip';
import type { ECharts } from 'echarts/core';

/**
 * @summary Chart component powered by Apache ECharts.
 * @documentation https://zinc.style/components/data-chart
 * @status experimental
 * @since 1.0
 *
 * @csspart base - The component's base wrapper.
 *
 * @event zn-chart-click - Emitted when a data point, bar or slice is clicked.
 * @event zn-chart-zoom - Emitted when a `zoomable` chart narrows to a dragged range, with `{ from, to }` as x-axis values (category labels on a category axis), or both null when it shows everything again.
 * @event zn-load - Emitted after `data` changes, whether set directly, fetched from `data-url` or streamed live.
 */
interface Zoom { start?: number; end?: number; startValue?: number; endValue?: number }
interface XAxis { type: string; data: unknown[] }
interface PlotBounds { left: number; right: number; top: number; bottom: number }

export default class ZnChart extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = { 'zn-tooltip': ZnTooltip };

  @property() type: ChartType = 'bar';
  @property({ type: Array }) data: SeriesItem[] = [];
  @property({ type: Array }) categories: string[] = [];
  @property({ attribute: 'y-categories', type: Array }) yCategories: string[] = [];
  @property({ type: Array }) indicators: RadarIndicator[] = [];

  @property({ attribute: 'xaxis' }) xAxis: 'datetime' | 'category' | 'numeric';
  @property({ type: Number, attribute: 'd-size' }) datapointSize: number = 1;
  @property({ type: Boolean }) stacked = false;

  @property({ type: Boolean }) live = false;
  /** JSON series polled with `live`; otherwise fetched once, as a series array or `{categories, data}`. */
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
  /** An ISO 4217 code, such as USD, that formats every value as money in it. */
  @property() currency?: string;

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
  /** Labels each line's latest value at its end, for up to four lines. */
  @property({ attribute: 'end-labels', type: Boolean }) endLabels = false;
  /** Shows the series as chips above the chart, each with its latest value, that hide and show it when clicked. */
  @property({ attribute: 'legend-chips', type: Boolean }) legendChips = false;
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
  /** On line, area, bar and scatter charts, dragging across the plot narrows the chart to the dragged range. */
  @property({ type: Boolean }) zoomable = false;

  private chart?: ECharts;
  private plotInset = { left: 0, right: 0 };
  private echarts?: EChartsModule;
  private initPromise?: Promise<void>;
  private liveTimer?: number;
  private pollAbort?: AbortController;
  private loadedUrl = '';
  /** Set while `data-url` loads; cartesian charts show a placeholder until the data arrives. */
  @state() private loading = false;
  @state() private loadingOut = false;
  @state() private hiddenSeries: string[] = [];
  private legendHidden: string[] = [];
  @state() private chipColors: Record<string, string> = {};
  @state() private zoomLabel = '';
  // Read once when the press starts, as getOption deep-copies every data point
  private drag?: { from: number; moved: boolean; axis: XAxis; bounds: PlotBounds; tip: boolean };
  private riseIn = false;
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
    if (this.enableAnimations === false || this.enableAnimations === 0 || ZnChart.reducedMotion()) return 0;
    return Math.max(0, Math.min(1000, typeof this.enableAnimations === 'number' ? this.enableAnimations : 350));
  }

  private liveSeries(): SeriesItem[] {
    const duration = this.liveTransitionDuration();
    return this.liveWindow.series(this.hideZero).map(series => ({ ...series,
      animation: duration > 0, animationDuration: 0, animationDurationUpdate: duration,
      animationEasingUpdate: 'linear', animationThreshold: 10000,
    }));
  }

  private revealed = true;
  private revealObserver?: IntersectionObserver;

  // A chart below the fold holds its first draw until it scrolls into view, so its entry animation isn't over unseen
  private awaitReveal() {
    this.revealObserver?.disconnect();
    const animated = this.enableAnimations !== false && this.enableAnimations !== 0;
    this.revealed = !animated || this.live || ZnChart.reducedMotion();
    if (this.revealed) return;
    this.revealObserver = new IntersectionObserver(entries => {
      if (!entries.some(e => e.isIntersecting)) return;
      this.revealObserver?.disconnect();
      this.revealed = true;
      this.updateChart();
    }, { threshold: 0.3 });
    this.revealObserver.observe(this);
  }

  private static reducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private updateChart() {
    if (!this.revealed) return;
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
    if (this.legendChips) {
      // The chips stand in for the legend, which stays as the store of which series are shown
      const names = (this.data ?? []).map(s => s.name);
      option.legend = { ...option.legend, show: false, selected: Object.fromEntries(names.map(n => [n, !this.hiddenSeries.includes(n)])) };
      option.grid = { ...(option.grid as Record<string, unknown>), top: 16 };
    } else if (option.legend && this.legendHidden.length) {
      // replaceMerge rebuilds the legend, which would otherwise show every series again
      option.legend = { ...option.legend, selected: Object.fromEntries(this.legendHidden.map(n => [n, false])) };
    }
    if (this.canZoom()) {
      // A programmatic window only: the drag in onZoomMove sets it, and wheel or drag panning would fight page scroll
      option.dataZoom = [{
        id: 'zn-zoom', type: 'inside', xAxisIndex: 0, filterMode: 'filter',
        zoomOnMouseWheel: false, moveOnMouseMove: false, moveOnMouseWheel: false,
      }];
    }
    const grid = option.grid as { left?: number; right?: number } | undefined;
    this.plotInset = { left: grid?.left ?? 0, right: grid?.right ?? 0 };
    if (this.riseIn) this.prepareRise(option);
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
      this.chart?.setOption(option, { replaceMerge: ['series', 'legend', 'xAxis', 'yAxis'] });
    }
    if (this.loading && !this.dataUrl) this.endLoading();
    this.replaceLiveSeries = false;
    if (this.legendChips) this.chipColors = this.seriesColors();
  }

  private seriesColors(): Record<string, string> {
    const palette = (this.chart?.getOption().color ?? []) as string[];
    return Object.fromEntries((this.data ?? []).map((s, i) =>
      [s.name, s.color ? this.resolveColor(s.color) : palette[i % palette.length] ?? '']));
  }

  private toggleSeries(name: string) {
    const hidden = this.hiddenSeries.includes(name);
    const shown = (this.data ?? []).filter(s => !s.name.startsWith('_') && !this.hiddenSeries.includes(s.name)).length;
    if (!hidden && shown <= 1) return;
    this.hiddenSeries = hidden ? this.hiddenSeries.filter(n => n !== name) : [...this.hiddenSeries, name];
    // Toggled in place, so the series fades rather than the whole chart redrawing
    this.chart?.dispatchAction({ type: 'legendToggleSelect', name });
  }

  private canZoom() {
    return this.zoomable && !this.live && ['line', 'area', 'bar', 'scatter'].includes(this.type);
  }

  /** Shows the whole data set again after a drag has narrowed it. */
  resetZoom() {
    this.chart?.dispatchAction({ type: 'dataZoom', start: 0, end: 100 });
  }

  private xAxisInfo(option = this.chart?.getOption()): XAxis {
    const axis = (option?.xAxis as Partial<XAxis>[] | undefined)?.[0];
    return { type: axis?.type ?? 'category', data: axis?.data ?? [] };
  }

  private axisValue(value: number, axis = this.xAxisInfo()): string | number {
    if (axis.type !== 'category') return value;
    const item = axis.data[Math.round(value)];
    return String(item && typeof item === 'object' && 'value' in item ? (item as { value: unknown }).value : item ?? '');
  }

  private axisLabel(value: number, axis = this.xAxisInfo()): string {
    const v = this.axisValue(value, axis);
    if (typeof v === 'string') return v;
    return axis.type === 'time' ? new Date(v).toLocaleString(undefined, { dateStyle: 'medium' })
      : v.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  // The cartesian grid is laid out with fixed pixel offsets
  private plotBounds(option: ReturnType<ECharts['getOption']>): PlotBounds {
    const grid = (option.grid as Partial<PlotBounds>[] | undefined)?.[0];
    const host = this.shadowRoot!.getElementById('chart')!;
    return { left: grid?.left ?? 0, right: host.clientWidth - (grid?.right ?? 0), top: grid?.top ?? 0, bottom: grid?.bottom ?? 0 };
  }

  private pointerX(e: PointerEvent, { left, right }: PlotBounds) {
    const x = e.clientX - (e.currentTarget as HTMLElement).getBoundingClientRect().left;
    return Math.min(right, Math.max(left, x));
  }

  private onZoomStart = (e: PointerEvent) => {
    if (!this.chart || !this.canZoom() || e.button !== 0) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (!this.chart.containPixel('grid', [e.clientX - rect.left, e.clientY - rect.top])) return;
    const option = this.chart.getOption();
    const bounds = this.plotBounds(option);
    const tip = (option.tooltip as { show?: boolean }[] | undefined)?.[0]?.show !== false;
    this.drag = { from: this.pointerX(e, bounds), moved: false, axis: this.xAxisInfo(option), bounds, tip };
  };

  private onZoomMove = (e: PointerEvent) => {
    const drag = this.drag;
    if (!drag || !this.chart) return;
    // The press can be released outside the chart before the drag captured the pointer
    if (e.buttons === 0) {
      this.endDrag();
      return;
    }
    const x = this.pointerX(e, drag.bounds);
    const band = this.shadowRoot!.querySelector<HTMLElement>('.zoom-band')!;
    if (!drag.moved) {
      if (Math.abs(x - drag.from) < 4) return;
      drag.moved = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      // Off for the drag, or the tooltip and its axis line trail the band
      this.chart.setOption({ tooltip: { show: false } });
      this.hideRuler();
      band.style.top = `${drag.bounds.top}px`;
      band.style.bottom = `${drag.bounds.bottom}px`;
      band.classList.add('zoom-band--active');
    }
    const from = Math.min(x, drag.from);
    const to = Math.max(x, drag.from);
    band.style.left = `${from}px`;
    band.style.width = `${to - from}px`;
    const [la, lb] = [from, to].map(px => this.axisLabel(this.chart!.convertFromPixel({ xAxisIndex: 0 }, px) as number, drag.axis));
    band.firstElementChild!.textContent = la === lb ? la : `${la} – ${lb}`;
  };

  private endDrag() {
    const drag = this.drag;
    this.drag = undefined;
    if (drag?.moved) {
      this.shadowRoot!.querySelector('.zoom-band')!.classList.remove('zoom-band--active');
      this.chart?.setOption({ tooltip: { show: drag.tip } });
    }
    return drag;
  }

  private onZoomEnd = (e: PointerEvent) => {
    const drag = this.endDrag();
    if (!drag?.moved || !this.chart || e.type === 'pointercancel') return;
    const x = this.pointerX(e, drag.bounds);
    const [a, b] = [Math.min(x, drag.from), Math.max(x, drag.from)].map(px => {
      const v = this.chart!.convertFromPixel({ xAxisIndex: 0 }, px) as number;
      return drag.axis.type === 'category' ? Math.round(v) : v;
    });
    this.chart.dispatchAction({ type: 'dataZoom', startValue: a, endValue: b });
  };

  // Also fires for charts zoomed through their sync group, so each one tracks its own window
  private onDataZoom = (params: unknown) => {
    // A sync partner without zoomable has no window to narrow; one just switched off still clears its pill
    if (!this.canZoom() && !this.zoomLabel) return;
    const p = params as { batch?: Zoom[] } & Zoom;
    const zoom = p.batch?.[0] ?? p;
    const whole = zoom.startValue === undefined && (zoom.start ?? 0) <= 0 && (zoom.end ?? 100) >= 100;
    if (whole) {
      this.zoomLabel = '';
      this.emit('zn-chart-zoom', { detail: { from: null, to: null } });
      return;
    }
    if (zoom.startValue === undefined || zoom.endValue === undefined) return;
    const axis = this.xAxisInfo();
    const [la, lb] = [this.axisLabel(zoom.startValue, axis), this.axisLabel(zoom.endValue, axis)];
    this.zoomLabel = la === lb ? la : `${la} – ${lb}`;
    this.emit('zn-chart-zoom', { detail: { from: this.axisValue(zoom.startValue, axis), to: this.axisValue(zoom.endValue, axis) } });
  };

  private static pointValue(p: unknown): unknown {
    return Array.isArray(p) ? p[1] as unknown : p && typeof p === 'object' && 'value' in p ? (p as { value: unknown }).value : p;
  }

  // A stacked bar ends at its stack's running total, which ECharts sums per sign
  private barTop(seriesIndex: number, dataIndex: number): number | undefined {
    const series = this.data ?? [];
    const value = (s: SeriesItem) => ZnChart.pointValue(s.data[dataIndex]);
    const own = value(series[seriesIndex]);
    if (typeof own !== 'number') return undefined;
    const stackOf = (s: SeriesItem) => s.stack ?? (this.stacked ? 'total' : undefined);
    const stack = stackOf(series[seriesIndex]);
    if (stack === undefined) return own;
    const hidden = [...this.legendHidden, ...this.hiddenSeries];
    return series.slice(0, seriesIndex + 1)
      .filter(s => stackOf(s) === stack && !hidden.includes(s.name))
      .map(value)
      .filter((v): v is number => typeof v === 'number' && Math.sign(v) === Math.sign(own))
      .reduce((sum, v) => sum + v, 0);
  }

  // A dashed rule across the plot at the hovered bar's top, to compare it against every other bar
  private showRuler = (params: unknown) => {
    const { seriesIndex, dataIndex } = params as { seriesIndex: number; dataIndex: number };
    const top = this.barTop(seriesIndex, dataIndex);
    const ruler = this.shadowRoot?.querySelector<HTMLElement>('.bar-ruler');
    if (top === undefined || !ruler || !this.chart || this.drag?.moved) return;
    ruler.style.top = `${this.chart.convertToPixel({ yAxisIndex: 0 }, top)}px`;
    ruler.style.left = `${this.plotInset.left}px`;
    ruler.style.right = `${this.plotInset.right}px`;
    ruler.firstElementChild!.textContent = formatValue(top, this.yAxisAppend, this.currency);
    ruler.classList.add('bar-ruler--active');
  };

  private hideRuler = () => {
    this.shadowRoot?.querySelector('.bar-ruler')?.classList.remove('bar-ruler--active');
  };

  private latestValue(series: SeriesItem): string {
    if (series.summary !== undefined) return series.summary;
    const point = (series.data as unknown[]).map(ZnChart.pointValue).reverse().find((v): v is number => typeof v === 'number');
    return point === undefined ? '' : formatValue(point, this.yAxisAppend, this.currency);
  }

  private renderLegendChips() {
    const series = (this.data ?? []).filter(s => !s.name.startsWith('_'));
    if (!this.legendChips || series.length < 2) return '';
    const shown = series.filter(s => !this.hiddenSeries.includes(s.name)).length;
    return html`<div class="legend-chips" role="group" aria-label="Series">
      ${series.map(s => {
        const hidden = this.hiddenSeries.includes(s.name);
        const chip = html`<button type="button"
                                  class=${classMap({ 'legend-chip': true, 'legend-chip--hidden': hidden })}
                                  aria-pressed=${hidden ? 'false' : 'true'}
                                  aria-disabled=${!hidden && shown <= 1 ? 'true' : 'false'}
                                  @click=${() => this.toggleSeries(s.name)}>
          <span class="legend-chip__swatch" style=${styleMap({ background: this.chipColors[s.name] })}></span>
          ${s.name}
          <span class="legend-chip__value">${this.latestValue(s)}</span>
        </button>`;
        return s.description ? html`<zn-tooltip content=${s.description}>${chip}</zn-tooltip>` : chip;
      })}
    </div>`;
  }

  // Draws the loaded series flat on the baseline first, so ECharts animates them up to their values
  private prepareRise(option: ReturnType<ZnChart['buildOption']>) {
    this.riseIn = false;
    if (!ZnChart.riseTypes.includes(this.type) || ZnChart.reducedMotion()) return;
    const series = (Array.isArray(option.series) ? option.series : option.series ? [option.series] : []) as Record<string, unknown>[];
    const flat = (v: unknown): unknown => typeof v === 'number' ? 0
      : Array.isArray(v) ? [v[0], 0, ...v.slice(2)]
        : v && typeof v === 'object' && 'value' in v ? { ...v, value: flat((v as { value: unknown }).value) } : v;
    this.chart?.setOption({
      ...option,
      animation: false,
      series: series.map((item, idx) => ({
        ...item, id: `rise-${idx}`, data: Array.isArray(item.data) ? item.data.map(flat) : item.data,
      })),
    }, { replaceMerge: ['series', 'legend', 'xAxis', 'yAxis'] });
    option.animation = true;
    option.animationDurationUpdate = 450;
    option.animationEasingUpdate = 'cubicOut';
    // Same ids as the flat pass, so ECharts updates those series rather than drawing new ones in
    option.series = series.map((item, idx) => ({
      ...item, id: `rise-${idx}`, animationDelayUpdate: idx * 40,
    })) as typeof option.series;
  }

  private static readonly riseTypes: ChartType[] = ['line', 'area', 'bar'];
  private static readonly viewOnly = ['liveStatus', 'loading', 'loadingOut', 'hiddenSeries', 'chipColors', 'zoomLabel'];

  protected willUpdate(changed: PropertyValues) {
    super.willUpdate(changed);
    if ((changed.has('dataUrl') || changed.has('live')) && this.dataUrl && !this.live && this.dataUrl !== this.loadedUrl) {
      this.loading = true;
    }
    // Inline data still waits on ECharts and the reveal, so it holds the skeleton until its first draw
    if (!this.hasUpdated && !this.dataUrl && !this.live) this.loading = true;
  }

  protected updated(changed: PropertyValues) {
    super.updated(changed);
    if (changed.has('data')) this.emit('zn-load');
    if (!this.chart) return;
    if (this.legendChips || changed.has('legendChips')) this.sizePlot();
    // A window kept as category indices would land on different points of the new data
    if (this.zoomLabel && ['data', 'categories', 'zoomable'].some(key => changed.has(key))) this.resetZoom();
    if (['live', 'dataUrl', 'streamUrl', 'liveRenewUrl', 'liveInterval'].some(key => changed.has(key))) this.startLive();
    if ([...changed.keys()].some(key => !ZnChart.viewOnly.includes(key as string))) this.updateChart();
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('scroll', this.hideTipOnScroll, { capture: true, passive: true });
    if (this.hasUpdated && !this.chart) this.initPromise = this.initChart().catch(() => undefined);
  }

  private tipShown = false;

  // Scrolling moves the chart from under a still pointer, which ECharts never sees leave, so its body-level tooltip
  // would stay stranded on the page
  private hideTipOnScroll = () => {
    if (!this.tipShown) return;
    this.tipShown = false;
    this.chart?.dispatchAction({ type: 'hideTip' });
  };

  private readonly resizeObserver = new ResizeController(this, {
    target: null,
    skipInitial: true,
    callback: () => {
      this.sizePlot();
      this.chart?.resize();
    },
  });

  // `height` includes the legend chips, so a chart with them is no taller than one without
  private sizePlot() {
    const host = this.shadowRoot?.getElementById('chart');
    if (!host) return;
    const chips = this.shadowRoot?.querySelector<HTMLElement>('.legend-chips');
    const plot = chips ? this.height - chips.offsetHeight - parseFloat(getComputedStyle(chips).marginBottom) : this.height;
    if (host.style.height === `${plot}px`) return;
    host.style.height = `${plot}px`;
    host.parentElement!.style.setProperty('--plot-height', `${plot}px`);
    this.chart?.resize();
  }

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

  // Theme colour names, so a chart can colour by meaning (success, danger…) in the theme's own shades
  private resolveColor = (color: string): string => {
    const tokens: Record<string, string> = {success: 'success', warning: 'warning', danger: 'error', error: 'error', info: 'info', neutral: 'muted-text'};
    const token = tokens[color];
    const rgb = token ? getComputedStyle(this).getPropertyValue(`--zn-color-${token}`).trim() : '';
    return rgb ? `rgb(${rgb})` : color;
  };

  private getStrongTextColor(): string | undefined {
    const rgb = getComputedStyle(this).getPropertyValue('--zn-color-text').trim();
    return rgb ? `rgb(${rgb})` : undefined;
  }

  private getSurfaceColor(): string | undefined {
    const rgb = getComputedStyle(this).getPropertyValue('--zn-color-panel').trim();
    return rgb ? `rgb(${rgb})` : undefined;
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
      currency: this.currency,
      stacked: this.stacked,
      enableAnimations: ZnChart.reducedMotion() ? false : this.enableAnimations,
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
      endLabels: this.endLabels,
      hiddenSeries: this.legendHidden,
      surfaceColor: this.getSurfaceColor(),
      resolveColor: this.resolveColor,
      fontFamily: getComputedStyle(this).fontFamily || undefined,
      strongTextColor: this.getStrongTextColor(),
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
    this.sizePlot();

    const echarts = await loadECharts();
    if (!this.isConnected || this.chart) return;
    this.echarts = echarts;

    this.chart = echarts.init(host);
    // A new instance starts unzoomed, as after a theme or type change
    if (this.zoomLabel) {
      this.zoomLabel = '';
      this.emit('zn-chart-zoom', { detail: { from: null, to: null } });
    }
    // A snapshot that arrived before ECharts loaded cleared this without reaching a chart
    this.replaceLiveSeries = true;
    this.awaitReveal();
    this.updateChart();
    this.chart.on('showTip', () => { this.tipShown = true; });
    this.chart.on('datazoom', this.onDataZoom);
    this.chart.on('mouseover', { seriesType: 'bar' }, this.showRuler);
    this.chart.on('mouseout', { seriesType: 'bar' }, this.hideRuler);
    this.chart.on('globalout', this.hideRuler);
    this.chart.on('legendselectchanged', params => {
      const { selected } = params as { selected: Record<string, boolean> };
      this.legendHidden = Object.keys(selected).filter(name => !selected[name]);
      if (this.type === 'bar') this.chart?.setOption({ series: this.buildOption().series });
    });
    this.chart.on('click', params => {
      this.emit('zn-chart-click', {
        detail: {
          seriesName: params.seriesName ?? '',
          name: params.name,
          dataIndex: params.dataIndex,
          value: params.value,
        },
      });
    });

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
    if (!this.isConnected) return;
    if (!this.live) { void this.loadData(); return; }
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

  private async loadData() {
    if (!this.dataUrl || this.dataUrl === this.loadedUrl) return;
    const controller = new AbortController(); this.pollAbort = controller;
    try {
      const res = await fetch(this.dataUrl, {
        signal: controller.signal,
        credentials: 'same-origin',
        headers: { Accept: 'application/json', 'x-kx-fetch-style': 'raw-json' },
      });
      if (res.ok) {
        const body = await res.json() as SeriesItem[] | { data?: SeriesItem[]; categories?: string[] };
        if (controller.signal.aborted) return;
        this.loadedUrl = this.dataUrl;
        this.riseIn = true;
        if (Array.isArray(body)) {
          this.data = body;
        } else {
          this.categories = body.categories ?? this.categories;
          this.data = body.data ?? [];
        }
      }
    } catch { /* keep what the chart already shows */ }
    if (controller.signal.aborted) return;
    this.endLoading();
  }

  private endLoading() {
    this.loading = false;
    this.loadingOut = true;
    window.setTimeout(() => { this.loadingOut = false; }, 400);
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
      this.sizePlot();
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
    if (this.revealed) this.chart.setOption({ ...this.buildOption() });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('scroll', this.hideTipOnScroll, { capture: true });
    this.revealObserver?.disconnect();
    this.stopLive();
    this.chart?.dispose();
    this.chart = undefined;
  }

  private renderLoading() {
    if (!(this.loading || this.loadingOut) || !ZnChart.riseTypes.includes(this.type)) return null;
    // Until data arrives the series count is unknown, so it assumes one: no legend, or chips about to appear
    const named = (this.data ?? []).filter(s => !s.name.startsWith('_')).length;
    const layout = this.legendChips ? (named < 2 ? 'chips' : 'chipped') : named > 1 ? 'legend' : 'plain';
    return html`
      <div class="${classMap({ loading: true, [`loading--${layout}`]: true, 'loading--out': !this.loading })}"
           role="status"
           aria-label="Loading chart">
        ${layout === 'legend' ? html`
          <div class="loading__legend">
            ${[48, 40, 52, 36].map(w => html`<span class="loading__pill" style="width: ${w}px"></span>`)}
          </div>` : ''}
        ${layout === 'chips' ? html`
          <div class="loading__chips">
            ${[104, 96, 112].map(w => html`<span class="loading__pill" style="width: ${w}px"></span>`)}
          </div>` : ''}
        <div class="loading__plot">
          ${[0, 1, 2, 3, 4].map(i => html`
            <span class="loading__row" style="animation-delay: ${i * 120}ms">
              <span class="loading__pill loading__label"></span>
            </span>`)}
          <span class="loading__track"><span class="loading__pill loading__label"></span></span>
          <span class="loading__x">
            ${[0, 1, 2, 3, 4, 5].map(() => html`<span class="loading__pill"></span>`)}
          </span>
        </div>
      </div>`;
  }

  protected render(): unknown {
    return html`${this.renderLegendChips()}<div class="${classMap({ chart: true, 'chart--loading': this.loading, 'chart--zoomable': this.canZoom() })}">
      <div id="chart"
           @pointerdown=${this.onZoomStart}
           @pointermove=${this.onZoomMove}
           @pointerup=${this.onZoomEnd}
           @pointercancel=${this.onZoomEnd}
           @dblclick=${() => this.zoomLabel && this.resetZoom()}></div>
      ${this.type === 'bar' ? html`<div class="bar-ruler" aria-hidden="true"><span class="bar-ruler__label"></span></div>` : ''}
      ${this.canZoom() ? html`<div class="zoom-band" aria-hidden="true"><span class="zoom-band__label"></span></div>` : ''}
      ${this.zoomLabel ? html`
        <button type="button" class="zoom-reset" aria-label="Show all data, currently ${this.zoomLabel}" @click=${() => this.resetZoom()}>
          ${this.zoomLabel}
          <span class="zoom-reset__action">Show all</span>
        </button>` : ''}
      ${this.renderLoading()}
      ${this.live && (this.streamUrl || this.liveRenewUrl) ? html`<div role="status" aria-live="polite">Live: ${this.liveStatus}${this.liveWindow.frame ? ` · ${this.liveWindow.frame.resolution_seconds}s intervals · Expected range: ${this.liveWindow.predictionStatus}` : ''}</div>` : ''}
    </div>`;
  }
}
