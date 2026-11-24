// src/components/chart/builders.ts
import type { EChartsOption } from 'echarts';

export type ChartType =
  | 'area'
  | 'bar'
  | 'donut'
  | 'funnel'
  | 'gauge'
  | 'heatmap'
  | 'line'
  | 'pie'
  | 'radar'
  | 'sankey'
  | 'scatter'
  | 'sunburst'
  | 'treemap';

export interface SeriesItem {
  /** Stable identity for incremental live updates. */
  id?: string;
  animation?: boolean;
  animationDuration?: number;
  animationDurationUpdate?: number;
  animationEasingUpdate?: 'linear';
  animationThreshold?: number;
  name: string;
  data: any[];
  color?: string;
  /** Shown on its legend chip in place of its latest value, such as a total over the whole range. */
  summary?: string;
  /** Says what the series measures, as its legend chip's tooltip. */
  description?: string;
  /** Series sharing a stack ID are stacked, overriding the chart-wide `stacked` setting. */
  stack?: string;
  stackStrategy?: 'all' | 'samesign' | 'positive' | 'negative';
  /** Fill below a line, for example `{ opacity: 0.15 }`; `{ opacity: 0 }` keeps a stacked base invisible. */
  areaStyle?: Record<string, unknown>;
  lineStyle?: Record<string, unknown>;
  symbol?: string;
  /** Excludes the series from mouse interaction and tooltips. */
  silent?: boolean;
  z?: number;
}

export interface SankeyEdge {
  source: string;
  target: string;
  value: number;
}

export interface PieDataItem {
  name?: string;
  value: number;
  color?: string;
  itemStyle?: Record<string, unknown>;
}

export interface RadarIndicator {
  name: string;
  max?: number;
  min?: number;
  color?: string;
}

export interface BuilderProps {
  type: ChartType;
  data: SeriesItem[];
  categories: string[];
  xAxisType?: 'datetime' | 'category' | 'numeric';
  yAxisAppend?: string;
  /** An ISO 4217 code, such as USD, that formats every value as money in it. */
  currency?: string;
  stacked: boolean;
  enableAnimations: boolean | number;
  datapointSize: number;
  colors?: string[];
  theme: 'light' | 'dark';
  smooth?: boolean;
  scale?: boolean | number;
  textColor?: string;
  borderColor?: string;
  innerRadius?: number | string;
  outerRadius?: number | string;
  showLabels?: boolean;
  yCategories?: string[];
  indicators?: RadarIndicator[];
  minValue?: number;
  maxValue?: number;
  /** Marks each line's last point with a dot and hides the others. */
  markLatest?: boolean;
  /** Labels each line's last value at its end, when there are few enough lines for the labels to stay readable. */
  endLabels?: boolean;
  /** Series toggled off in the legend; a bar stack rounds and parts its outermost shown segments. */
  hiddenSeries?: string[];
  /** The colour the chart sits on, ringing the latest-point dot so it stays clear where lines cross. */
  surfaceColor?: string;
  /** The font the chart's text inherits, so charts use the theme's typeface rather than ECharts' default. */
  fontFamily?: string;
  /** Text that names things in the chart itself, such as flow stage labels; axis text stays `textColor`. */
  strongTextColor?: string;
  /** Turns a theme colour name (success, warning, danger, info, neutral) into a colour; others pass through. */
  resolveColor?: (color: string) => string;
}

function textColorOf(props: BuilderProps) {
  return props.textColor ?? (props.theme === 'dark' ? 'rgb(161, 161, 170)' : 'rgb(113, 113, 122)');
}

// ECharts gives axis labels a fixed grey of their own rather than inheriting textStyle, so the theme is set here
function axisLabelStyle(props: BuilderProps) {
  return { color: textColorOf(props), fontFamily: props.fontFamily, fontSize: 11 };
}

function baseOption(props: BuilderProps, tooltipTrigger: 'axis' | 'item'): EChartsOption {
  const textColor = textColorOf(props);
  const animEnabled = props.enableAnimations !== false && props.enableAnimations !== 0;
  const animDuration = typeof props.enableAnimations === 'number' ? props.enableAnimations : 450;
  return {
    animation: animEnabled,
    animationDuration: animDuration,
    animationEasing: 'cubicOut',
    ...(props.colors ? { color: props.colors } : {}),
    textStyle: { color: textColor, fontFamily: props.fontFamily },
    tooltip: {
      trigger: tooltipTrigger,
      appendTo: 'body',
      // Eased, it trails the pointer on every move
      transitionDuration: 0,
      padding: [8, 12],
      ...(props.surfaceColor ? { backgroundColor: props.surfaceColor } : {}),
      ...(props.borderColor ? { borderColor: props.borderColor } : {}),
      // Appended to the body, so theme variables resolve from the document
      extraCssText: 'border-radius: var(--zn-border-radius-large, 8px); box-shadow: var(--zn-shadow-medium, 0 4px 12px rgba(0, 0, 0, .12));',
      textStyle: { fontFamily: props.fontFamily, ...(props.strongTextColor ? { color: props.strongTextColor } : {}) },
      valueFormatter: unitFormatter(props),
    },
    legend: {
      type: 'scroll',
      top: 0,
      right: 0,
      icon: 'circle',
      textStyle: { color: textColor },
      pageIconSize: 10,
      pageTextStyle: { color: textColor },
    },
  };
}

// A surface-coloured outline that parts a mark from its neighbours, or from lines it overlaps
function ring(props: BuilderProps): Record<string, unknown> {
  return props.surfaceColor ? { borderColor: props.surfaceColor, borderWidth: 2 } : {};
}

// Centred charts keep their legend beneath them, rather than in a corner far from the marks
function legendBelow(base: EChartsOption): EChartsOption['legend'] {
  return { ...(base.legend as Record<string, unknown>), top: 'auto', right: 'auto', bottom: 0, left: 'center' };
}

// Past this many lines, end labels crowd each other and the legend carries the names alone
const MAX_END_LABELS = 4;

function showEndLabels(props: BuilderProps) {
  return !!props.endLabels && props.data.filter((s) => !s.name.startsWith('_')).length <= MAX_END_LABELS;
}

/** A value as the chart's labels show it: money in its currency, other whole numbers as they are and the rest to one
 * decimal place, followed by `append`. */
export function formatValue(value: number, append = '', currency?: string) {
  if (currency) return moneyFormat(currency).format(value);
  return `${Number.isInteger(value) ? value : value.toFixed(1)}${append}`;
}

// Formatters are costly to build and these run for every label on every redraw
const moneyFormats = new Map<string, Intl.NumberFormat>();
function moneyFormat(currency: string, wholeUnits = false) {
  const key = `${currency}:${wholeUnits}`;
  let format = moneyFormats.get(key);
  if (!format) {
    format = new Intl.NumberFormat(undefined, {
      style: 'currency', currency, currencyDisplay: 'narrowSymbol', ...(wholeUnits ? { maximumFractionDigits: 0 } : {}),
    });
    moneyFormats.set(key, format);
  }
  return format;
}

// Tooltips show exact values in their units, or leave ECharts' own formatting when the chart has none
function unitFormatter(props: BuilderProps) {
  const { currency, yAxisAppend } = props;
  if (currency) return (v: number | string) => typeof v === 'number' ? moneyFormat(currency).format(v) : `${v}`;
  if (yAxisAppend) return (v: number | string) => `${v}${yAxisAppend}`;
  return undefined;
}

function endLabel(props: BuilderProps, s: SeriesItem): Record<string, unknown> {
  if (!showEndLabels(props) || s.silent || s.name.startsWith('_')) return {};
  return {
    endLabel: {
      show: true,
      color: props.strongTextColor ?? props.textColor,
      fontFamily: props.fontFamily,
      formatter: (p: { value: unknown }) => {
        const v = Array.isArray(p.value) ? p.value[1] as unknown : p.value;
        return typeof v === 'number' ? formatValue(v, props.yAxisAppend, props.currency) : '';
      },
    },
    labelLayout: { hideOverlap: true },
  };
}

// Sized to the widest value the lines span rather than the last one, so a live chart's plot doesn't jitter as it ticks.
// Roughly 7.5px a character, plus the gap and the end dot.
function endLabelRoom(props: BuilderProps) {
  let min = Infinity;
  let max = -Infinity;
  props.data.filter(s => !s.silent && !s.name.startsWith('_')).forEach(s => (s.data ?? []).forEach(p => {
    const v: unknown = Array.isArray(p) ? p[1] : p;
    if (typeof v === 'number') {
      min = Math.min(min, v);
      max = Math.max(max, v);
    }
  }));
  if (min > max) return 20;
  const chars = Math.max(...[min, max].map(v => formatValue(v, props.yAxisAppend, props.currency).length));
  return Math.ceil(chars * 7.5) + 20;
}

function commonOption(props: BuilderProps): EChartsOption {
  const base = baseOption(props, 'axis');
  // A lone series is named by the chart's own caption, so its legend only repeats it.
  const named = props.data.filter((s) => !s.name.startsWith('_')).length;
  return {
    ...base,
    legend: { ...(base.legend as Record<string, unknown>), show: named > 1 },
    grid: {
      left: 40,
      right: showEndLabels(props) ? endLabelRoom(props) : 20,
      // Room for the legend when it shows, else just the top tick label's overhang
      top: named > 1 ? 40 : 12,
      bottom: 30,
    },
  };
}

function hasNoData(data: SeriesItem[]): boolean {
  return data.length === 0 || data.every((s) => !s.data || s.data.length === 0);
}

function buildYAxis(props: BuilderProps) {
  const emptyOpts = hasNoData(props.data) ? { min: 0, max: 6 } : {};
  const scaleOpts = props.scale
    ? {
        scale: true,
        ...(typeof props.scale === 'number'
          ? { boundaryGap: [`${props.scale}%`, `${props.scale}%`] as [string, string] }
          : {}),
      }
    : {};
  const splitLineOpts = props.borderColor
    ? { splitLine: { lineStyle: { color: props.borderColor } } }
    : {};
  return {
    type: 'value' as const,
    ...splitLineOpts,
    ...emptyOpts,
    ...scaleOpts,
    axisLabel: {
      ...axisLabelStyle(props),
      ...(props.currency
        // Ticks fall on round amounts, so they drop the cents
        ? { formatter: (v: number) => moneyFormat(props.currency!, true).format(v) }
        : props.yAxisAppend ? { formatter: (v: number) => `${v}${props.yAxisAppend}` } : {}),
    },
  };
}

function buildXAxis(props: BuilderProps, edgeToEdge = false) {
  const axisLineOpts = {
    ...(props.borderColor ? { axisLine: { lineStyle: { color: props.borderColor } } } : {}),
    axisTick: { show: false },
    axisLabel: axisLabelStyle(props),
  };
  if (props.xAxisType === 'datetime') {
    return {
      type: 'time' as const,
      ...axisLineOpts,
      // Day and month boundaries stand out by colour; ECharts' default bold outweighs the data
      axisLabel: {
        ...axisLineOpts.axisLabel,
        // A bare day number reads as a value, so boundaries carry their month
        formatter: { year: '{primary|{yyyy}}', month: '{primary|{MMM} {yyyy}}', day: '{primary|{d} {MMM}}' },
        rich: { primary: { fontWeight: 500, color: props.strongTextColor ?? textColorOf(props) } },
      },
    };
  }
  if (props.xAxisType === 'numeric') return { type: 'value' as const, ...axisLineOpts };
  return {
    type: 'category' as const,
    data: props.categories,
    ...(edgeToEdge ? { boundaryGap: false } : {}),
    ...axisLineOpts,
  };
}

/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
function normalizeData(data: any[]): any[] {
  return data.map((d: any) => {
    if (d && typeof d === 'object' && !Array.isArray(d) && 'x' in d && 'y' in d) {
      return [d.x, d.y];
    }
    return d;
  });
}
/* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */

function seriesFromProps(
  props: BuilderProps,
  seriesType: 'bar' | 'line' | 'scatter',
  extra: (s: SeriesItem) => Record<string, unknown> = () => ({}),
) {
  return props.data.map((s) => ({
    type: seriesType,
    name: s.name,
    data: normalizeData(s.data),
    ...(s.color ? { itemStyle: { color: props.resolveColor?.(s.color) ?? s.color } } : {}),
    ...(s.stack ? { stack: s.stack } : props.stacked ? { stack: 'total' } : {}),
    ...(props.enableAnimations !== false && props.enableAnimations !== 0 && seriesType === 'bar'
      ? { animationDelay: (idx: number) => Math.min(idx * 30, 300) }
      : {}),
    ...extra(s),
    ...seriesStyle(s),
  }));
}

// seriesStyle applies a series' own display options, which take precedence
// over chart-wide defaults. Bands are drawn as an invisible stacked base
// followed by a filled series holding the band's height.
function seriesStyle(s: SeriesItem): Record<string, unknown> {
  return {
    ...(s.id ? { id: s.id } : {}),
    ...(s.animation !== undefined ? { animation: s.animation } : {}),
    ...(s.animationDuration !== undefined ? { animationDuration: s.animationDuration } : {}),
    ...(s.animationDurationUpdate !== undefined ? { animationDurationUpdate: s.animationDurationUpdate } : {}),
    ...(s.animationEasingUpdate ? { animationEasingUpdate: s.animationEasingUpdate } : {}),
    ...(s.animationThreshold !== undefined ? { animationThreshold: s.animationThreshold } : {}),
    ...(s.stackStrategy ? { stackStrategy: s.stackStrategy } : {}),
    ...(s.areaStyle ? { areaStyle: s.areaStyle } : {}),
    ...(s.lineStyle ? { lineStyle: s.lineStyle } : {}),
    ...(s.symbol ? { symbol: s.symbol } : {}),
    ...(s.silent ? { silent: true, tooltip: { show: false } } : {}),
    ...(s.z !== undefined ? { z: s.z } : {}),
  };
}

export function buildBarOption(props: BuilderProps): EChartsOption {
  const common = commonOption(props);
  return {
    ...common,
    // A hairline helps find an X along a line; on bars the whole category band is the target
    tooltip: {
      ...(common.tooltip as Record<string, unknown>),
      axisPointer: {
        type: 'shadow',
        shadowStyle: { color: props.theme === 'dark' ? 'rgba(161, 161, 170, 0.12)' : 'rgba(113, 113, 122, 0.08)' },
      },
    },
    xAxis: buildXAxis(props),
    yAxis: buildYAxis(props),
    series: barEnds(props, seriesFromProps(props, 'bar', () => ({ barMaxWidth: 48 }))),
  };
}

const ROUNDED_UP = [4, 4, 0, 0];
const ROUNDED_DOWN = [0, 0, 4, 4];

// Rounds each bar's data end, square at the baseline. Each stacked segment above the first casts a hard surface-coloured
// shadow 2px down over the one beneath, parting them without a stroke, which would also lift the stack off the baseline.
// shortcut: only a stack's last shown series is rounded and only upward stacks are parted, so a zero top segment stays square
// and a negative stack's gap falls on the wrong side; track the outermost non-zero segment per category if that shows.
function barEnds(props: BuilderProps, series: Record<string, unknown>[]): Record<string, unknown>[] {
  const stackOf = (i: number) => props.data[i].stack ?? (props.stacked ? 'total' : undefined);
  const shown = series.map((_, i) => i).filter(i => !props.hiddenSeries?.includes(props.data[i].name));
  const tops = new Map(shown.map(i => [stackOf(i) ?? i, i]));
  const bottoms = new Map(shown.map(i => [stackOf(i) ?? i, i] as const).reverse());
  return series.map((s, i) => {
    const parted = stackOf(i) !== undefined && bottoms.get(stackOf(i)!) !== i;
    const rounded = tops.get(stackOf(i) ?? i) === i;
    const value = (d: unknown) => (Array.isArray(d) ? d[1] as unknown : d);
    return {
      ...s,
      ...(rounded ? {
        data: (s.data as unknown[]).map((d) => {
          const v = value(d);
          return typeof v === 'number' && v < 0 ? { value: d, itemStyle: { borderRadius: ROUNDED_DOWN } } : d;
        }),
      } : {}),
      itemStyle: {
        ...(s.itemStyle as Record<string, unknown>),
        borderRadius: rounded ? ROUNDED_UP : 0,
        ...(parted && props.surfaceColor ? { shadowColor: props.surfaceColor, shadowOffsetY: 2, shadowBlur: 0 } : {}),
      },
    };
  });
}

// latestMarker hides a line's points except the last, which gets a dot ringed in the surface colour.
function latestMarker(props: BuilderProps, s: SeriesItem): Record<string, unknown> {
  if (!props.markLatest || s.silent || !s.data?.length) return {};
  const data: unknown[] = normalizeData(s.data);
  // A null is a gap, so the marker goes on the last point that has a value.
  const last = data.findLastIndex(hasValue);
  if (last < 0) return { symbol: 'none' };
  return {
    symbol: 'none',
    data: data.map((d, i) => (i === last ? {
      value: d, symbol: 'circle', symbolSize: 8,
      // The series' hover scale is sized for its datapointSize points, which would blow this 8px dot up to 80px at size 1
      emphasis: { scale: 1.25 },
      ...(props.surfaceColor ? { itemStyle: ring(props) } : {}),
    } : d)),
  };
}

// A null is a gap, as is an [x, y] pair whose y is null
function hasValue(d: unknown): boolean {
  return d !== null && d !== undefined && !(Array.isArray(d) && d[d.length - 1] === null);
}

// A value with gaps either side has no line to it, so it needs a dot to be seen at all
function lineMarkers(props: BuilderProps, s: SeriesItem): Record<string, unknown> {
  const marked = latestMarker(props, s);
  if (s.silent || !s.data?.length) return marked;
  const data: unknown[] = (marked.data as unknown[] | undefined) ?? normalizeData(s.data);
  const lone = (d: unknown, i: number) => hasValue(d) && !hasValue(data[i - 1]) && !hasValue(data[i + 1])
    && !(d && typeof d === 'object' && !Array.isArray(d));
  if (!data.some(lone)) return marked;
  return {
    ...marked,
    data: data.map((d, i) => lone(d, i)
      ? {
        value: d, symbol: 'circle', symbolSize: Math.max(props.datapointSize, 6),
        emphasis: { scale: 10 / Math.max(props.datapointSize, 6) },
        ...(props.surfaceColor ? { itemStyle: ring(props) } : {}),
      }
      : d),
  };
}

export function buildLineOption(props: BuilderProps): EChartsOption {
  return {
    ...commonOption(props),
    xAxis: buildXAxis(props, true),
    yAxis: buildYAxis(props),
    series: seriesFromProps(props, 'line', (s) => ({
      symbolSize: props.datapointSize,
      smooth: props.smooth,
      ...hoverDot(props),
      ...lineMarkers(props, s),
      ...endLabel(props, s),
    })),
  };
}

// The point under the pointer shows solid, ringed in the surface colour, rather than as a hollow ring that reads as a
// gap; resting points are often 1px, so hover scales them up to a 10px dot
function hoverDot(props: BuilderProps): Record<string, unknown> {
  return {
    symbol: 'circle',
    emphasis: {
      scale: Math.max(10 / (props.datapointSize || 1), 1.25),
      ...(props.surfaceColor ? { itemStyle: ring(props) } : {}),
    },
  };
}

export function buildAreaOption(props: BuilderProps): EChartsOption {
  return {
    ...commonOption(props),
    xAxis: buildXAxis(props, true),
    yAxis: buildYAxis(props),
    series: seriesFromProps(props, 'line', (s) => ({
      symbolSize: props.datapointSize,
      smooth: props.smooth,
      areaStyle: { opacity: 0.1 },
      ...hoverDot(props),
      ...lineMarkers(props, s),
      ...endLabel(props, s),
    })),
  };
}

export function buildScatterOption(props: BuilderProps): EChartsOption {
  return {
    ...commonOption(props),
    xAxis: { ...buildXAxis({ ...props, xAxisType: props.xAxisType ?? 'numeric' }), splitLine: { show: false } },
    yAxis: buildYAxis(props),
    series: seriesFromProps(props, 'scatter', () => ({
      symbolSize: Math.max(props.datapointSize, 8),
    })).map(s => ({ ...s, itemStyle: { ...(s.itemStyle as Record<string, unknown>), ...ring(props) } })),
  };
}

function normalizePieData(data: any[], categories: string[]): PieDataItem[] {
  return data.map((item: number | PieDataItem, index) => {
    if (typeof item === 'number') {
      return { name: categories[index] ?? `${index + 1}`, value: item };
    }

    const { color, itemStyle, ...rest } = item;
    return {
      ...rest,
      name: item.name ?? categories[index] ?? `${index + 1}`,
      ...(color ? { itemStyle: { ...itemStyle, color } } : itemStyle ? { itemStyle } : {}),
    };
  });
}

export function buildPieOption(props: BuilderProps): EChartsOption {
  const first = props.data[0] ?? { name: '', data: [] };
  const textColor = props.textColor
    ?? (props.theme === 'dark' ? 'rgb(161, 161, 170)' : 'rgb(113, 113, 122)');
  const innerRadius = props.type === 'donut' ? (props.innerRadius ?? '50%') : 0;
  const outerRadius = props.outerRadius ?? '70%';

  const base = baseOption(props, 'item');
  return {
    ...base,
    legend: legendBelow(base),
    series: [{
      type: 'pie',
      name: first.name,
      data: normalizePieData(first.data ?? [], props.categories),
      radius: [innerRadius, outerRadius],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: { ...ring(props), borderRadius: props.type === 'donut' ? 4 : 0 },
      label: {
        show: props.showLabels ?? false,
        color: textColor,
      },
      labelLine: {
        show: props.showLabels ?? false,
        ...(props.borderColor ? { lineStyle: { color: props.borderColor } } : {}),
      },
      emphasis: {
        scaleSize: 4,
        label: { show: props.showLabels ?? false },
      },
    }],
  };
}

export function buildRadarOption(props: BuilderProps): EChartsOption {
  const indicators = props.indicators?.length
    ? props.indicators
    : props.categories.map((name) => ({ name }));

  const base = baseOption(props, 'item');
  return {
    ...base,
    legend: legendBelow(base),
    radar: { indicator: indicators, radius: '70%', center: ['50%', '45%'] },
    series: [{
      type: 'radar',
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: ring(props),
      data: props.data.map((series) => ({
        name: series.name,
        value: normalizeData(series.data),
        ...(series.color ? {
          itemStyle: { color: series.color },
          lineStyle: { color: series.color },
        } : {}),
      })),
    }],
  };
}

export function buildGaugeOption(props: BuilderProps): EChartsOption {
  const first = props.data[0] ?? { name: '', data: [] };
  const [firstValue] = first.data as unknown[];
  const data = typeof firstValue === 'number'
    ? [{ name: first.name, value: firstValue }]
    : normalizePieData(first.data ?? [], props.categories);

  return {
    ...baseOption(props, 'item'),
    legend: { show: false },
    series: [{
      type: 'gauge',
      name: first.name,
      min: props.minValue ?? 0,
      max: props.maxValue ?? 100,
      data,
      // A meter: the arc and its figure, without a dial's needle and scale
      progress: { show: true, roundCap: true, width: 12 },
      axisLine: { roundCap: true, lineStyle: { width: 12, ...(props.borderColor ? { color: [[1, props.borderColor]] } : {}) } },
      pointer: { show: false },
      anchor: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      title: { offsetCenter: [0, '30%'], color: props.textColor, fontFamily: props.fontFamily },
      detail: {
        valueAnimation: props.enableAnimations !== false && props.enableAnimations !== 0,
        formatter: unitFormatter(props) ?? '{value}',
        offsetCenter: [0, '-5%'],
        fontSize: 32,
        fontWeight: 600,
        color: props.strongTextColor ?? 'inherit',
        fontFamily: props.fontFamily,
      },
    }],
  };
}

export function buildFunnelOption(props: BuilderProps): EChartsOption {
  const first = props.data[0] ?? { name: '', data: [] };
  const data = normalizePieData(first.data ?? [], props.categories);
  const top = Math.max(0, ...data.map(d => d.value));
  return {
    ...baseOption(props, 'item'),
    legend: { show: false },
    series: [{
      type: 'funnel',
      name: first.name,
      min: props.minValue,
      max: props.maxValue,
      // A floor on width, so the last stage never narrows to a point that reads as zero
      minSize: '20%',
      gap: 2,
      data,
      itemStyle: { borderWidth: 0 },
      label: {
        show: props.showLabels ?? true,
        position: 'inside',
        color: '#fff',
        fontFamily: props.fontFamily,
        formatter: (p: { name: string; value?: unknown }) => top
          ? `${p.name}  ${formatValue(Number(p.value), props.yAxisAppend, props.currency)} · ${formatValue(Number(p.value) / top * 100, '%')}`
          : p.name,
      },
      emphasis: { label: { fontWeight: 'bold' } },
    }],
  };
}

function isHeatmapPoint(item: unknown): item is [unknown, unknown, number] {
  if (!Array.isArray(item)) return false;
  const point = item as unknown[];
  return typeof point[2] === 'number';
}

function heatmapExtent(data: unknown[], operation: 'max' | 'min', fallback: number): number {
  const values = data
    .filter(isHeatmapPoint)
    .map((item) => item[2]);
  return values.length ? Math[operation](...values) : fallback;
}

export function buildHeatmapOption(props: BuilderProps): EChartsOption {
  const first = props.data[0] ?? { name: '', data: [] };
  const data = first.data ?? [];
  return {
    ...baseOption(props, 'item'),
    legend: { show: false },
    grid: { left: 60, right: 20, top: 56, bottom: 30 },
    xAxis: { type: 'category', data: props.categories, axisLabel: axisLabelStyle(props) },
    yAxis: { type: 'category', data: props.yCategories ?? [], axisLabel: axisLabelStyle(props) },
    visualMap: {
      min: props.minValue ?? heatmapExtent(data, 'min', 0),
      max: props.maxValue ?? heatmapExtent(data, 'max', 100),
      calculable: true,
      orient: 'horizontal',
      right: 0,
      top: 0,
      itemHeight: 100,
      textStyle: { color: props.textColor },
    },
    series: [{
      type: 'heatmap',
      name: first.name,
      data,
      itemStyle: { ...ring(props), borderRadius: 4 },
      label: { show: props.showLabels ?? false },
      emphasis: {
        itemStyle: { borderColor: props.strongTextColor ?? props.textColor, borderWidth: 2 },
      },
    }],
  };
}

export function buildTreemapOption(props: BuilderProps): EChartsOption {
  const first = props.data[0] ?? { name: '', data: [] };
  return {
    ...baseOption(props, 'item'),
    legend: { show: false },
    series: [{
      type: 'treemap',
      name: first.name,
      data: first.data ?? [],
      // Wheel zoom would capture the page's scroll
      roam: false,
      top: 8,
      left: 0,
      right: 0,
      bottom: 36,
      itemStyle: { borderWidth: 0, gapWidth: 2, borderRadius: 4, ...(props.surfaceColor ? { borderColor: props.surfaceColor } : {}) },
      label: { show: props.showLabels ?? true, fontFamily: props.fontFamily },
      upperLabel: { show: false },
      // A wider gap between groups than within one keeps the hierarchy legible without header strips
      levels: [{ itemStyle: { gapWidth: 6 } }, { itemStyle: { gapWidth: 2 } }],
      breadcrumb: {
        left: 0,
        bottom: 0,
        itemStyle: {
          color: props.surfaceColor ?? 'transparent',
          borderColor: props.borderColor,
          borderWidth: 1,
          shadowBlur: 0,
          textStyle: { color: props.textColor, fontFamily: props.fontFamily },
        },
        emphasis: { itemStyle: { textStyle: { color: props.strongTextColor ?? props.textColor } } },
      },
    }],
  };
}

export function buildSunburstOption(props: BuilderProps): EChartsOption {
  const first = props.data[0] ?? { name: '', data: [] };
  return {
    ...baseOption(props, 'item'),
    legend: { show: false },
    series: [{
      type: 'sunburst',
      name: first.name,
      data: first.data ?? [],
      radius: [props.innerRadius ?? 0, props.outerRadius ?? '90%'],
      itemStyle: { ...ring(props), borderRadius: 4 },
      label: { show: props.showLabels ?? true, rotate: 'tangential', minAngle: 12, color: '#fff', fontFamily: props.fontFamily },
      emphasis: { focus: 'ancestor' },
    }],
  };
}

function deriveNodes(edges: SankeyEdge[]): { name: string }[] {
  const seen = new Set<string>();
  const nodes: { name: string }[] = [];
  for (const edge of edges) {
    if (!seen.has(edge.source)) {
      seen.add(edge.source);
      nodes.push({ name: edge.source });
    }
    if (!seen.has(edge.target)) {
      seen.add(edge.target);
      nodes.push({ name: edge.target });
    }
  }
  return nodes;
}

interface StyledSankeyItem { name?: string; itemStyle?: { color?: string }; lineStyle?: { color?: string } }

export function buildSankeyOption(props: BuilderProps): EChartsOption {
  const first = props.data[0] ?? { name: '', data: [] };
  const edges = (first.data ?? []) as (SankeyEdge & StyledSankeyItem)[];
  const explicitNodes = (first as { nodes?: StyledSankeyItem[] }).nodes;
  const resolve = props.resolveColor ?? ((color: string) => color);
  const tinted = <T extends StyledSankeyItem>(item: T): T => ({
    ...item,
    ...(item.itemStyle?.color ? { itemStyle: { ...item.itemStyle, color: resolve(item.itemStyle.color) } } : {}),
    ...(item.lineStyle?.color ? { lineStyle: { ...item.lineStyle, color: resolve(item.lineStyle.color) } } : {}),
  });
  const nodes = (explicitNodes ?? deriveNodes(edges)).map(tinted);
  const textColor = textColorOf(props);

  // Labels give each stage's share of what entered the flow, so the chart reads as a breakdown
  const targets = new Set(edges.map(edge => edge.target));
  const total = edges.filter(edge => !targets.has(edge.source)).reduce((sum, edge) => sum + edge.value, 0);
  const label = (p: { name: string; value?: unknown }) => !targets.has(p.name) || !total
    ? p.name
    : `${p.name}  {share|${(Number(p.value) / total * 100).toFixed(1)}%}`;

  return {
    ...baseOption(props, 'item'),
    legend: { show: false },
    series: [{
      type: 'sankey',
      name: first.name,
      data: nodes,
      links: edges.map(tinted),
      // Room on the right for the last column's labels, which sit outside its bars: roughly 7.5px a character at
      // 13px, plus the share
      left: 8,
      right: Math.ceil(Math.max(0, ...[...targets].map(name => name.length)) * 7.5) + 64,
      top: 8,
      bottom: 8,
      nodeWidth: 8,
      nodeGap: 14,
      // Keeps stages in the order given, so they read top to bottom as written
      layoutIterations: 0,
      draggable: false,
      itemStyle: { borderWidth: 0, borderRadius: 2 },
      label: {
        color: props.strongTextColor ?? textColor,
        fontFamily: props.fontFamily,
        fontSize: 13,
        fontWeight: 500,
        textBorderWidth: 0,
        formatter: label,
        rich: { share: { color: props.strongTextColor ?? textColor, fontFamily: props.fontFamily, fontWeight: 600, fontSize: 13 } },
      },
      lineStyle: {
        color: 'target',
        curveness: 0.5,
        opacity: props.theme === 'dark' ? 0.35 : 0.22,
      },
      emphasis: { focus: 'adjacency', lineStyle: { opacity: props.theme === 'dark' ? 0.55 : 0.4 } },
    }],
  };
}
