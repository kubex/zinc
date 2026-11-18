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

function baseOption(props: BuilderProps, tooltipTrigger: 'axis' | 'item'): EChartsOption {
  const fallback = props.theme === 'dark' ? 'rgb(161, 161, 170)' : 'rgb(113, 113, 122)';
  const textColor = props.textColor ?? fallback;
  const animEnabled = props.enableAnimations !== false && props.enableAnimations !== 0;
  const animDuration = typeof props.enableAnimations === 'number' ? props.enableAnimations : 1500;
  return {
    animation: animEnabled,
    animationDuration: animDuration,
    animationEasing: 'cubicOut',
    ...(props.colors ? { color: props.colors } : {}),
    textStyle: { color: textColor, fontFamily: props.fontFamily },
    tooltip: {
      trigger: tooltipTrigger,
      appendTo: 'body',
      textStyle: { fontFamily: props.fontFamily },
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

function commonOption(props: BuilderProps): EChartsOption {
  const base = baseOption(props, 'axis');
  // A lone series is named by the chart's own caption, so its legend only repeats it.
  const named = props.data.filter((s) => !s.name.startsWith('_')).length;
  return {
    ...base,
    legend: { ...(base.legend as Record<string, unknown>), show: named > 1 },
    grid: {
      left: 40,
      // Money labels carry a symbol, separators and cents, so they need more room than a plain figure
      right: showEndLabels(props) ? (props.currency ? 96 : 64) : 20,
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
    axisLabel: props.currency
      // Ticks fall on round amounts, so they drop the cents
      ? { formatter: (v: number) => moneyFormat(props.currency!, true).format(v) }
      : props.yAxisAppend ? { formatter: (v: number) => `${v}${props.yAxisAppend}` } : {},
  };
}

function buildXAxis(props: BuilderProps, edgeToEdge = false) {
  const axisLineOpts = props.borderColor
    ? { axisLine: { lineStyle: { color: props.borderColor } } }
    : {};
  if (props.xAxisType === 'datetime') return { type: 'time' as const, ...axisLineOpts };
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
      ? { animationDelay: (idx: number) => idx * 50 }
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
    series: barEnds(props, seriesFromProps(props, 'bar')),
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
  const data = normalizeData(s.data);
  // A null is a gap, so the marker goes on the last point that has a value.
  const last = data.findLastIndex(d => d !== null && d !== undefined && !(Array.isArray(d) && d[d.length - 1] === null));
  if (last < 0) return { symbol: 'none' };
  return {
    symbol: 'none',
    data: data.map((d, i) => (i === last ? {
      value: d, symbol: 'circle', symbolSize: 8,
      ...(props.surfaceColor ? { itemStyle: { borderColor: props.surfaceColor, borderWidth: 2 } } : {}),
    } : d)),
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
      ...latestMarker(props, s),
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
      ...(props.surfaceColor ? { itemStyle: { borderColor: props.surfaceColor, borderWidth: 2 } } : {}),
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
      ...latestMarker(props, s),
      ...endLabel(props, s),
    })),
  };
}

export function buildScatterOption(props: BuilderProps): EChartsOption {
  return {
    ...commonOption(props),
    xAxis: buildXAxis({ ...props, xAxisType: props.xAxisType ?? 'numeric' }),
    yAxis: buildYAxis(props),
    series: seriesFromProps(props, 'scatter', () => ({
      symbolSize: props.datapointSize,
    })),
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

  return {
    ...baseOption(props, 'item'),
    series: [{
      type: 'pie',
      name: first.name,
      data: normalizePieData(first.data ?? [], props.categories),
      radius: [innerRadius, outerRadius],
      center: ['50%', '55%'],
      avoidLabelOverlap: true,
      label: {
        show: props.showLabels ?? false,
        color: textColor,
      },
      labelLine: {
        show: props.showLabels ?? false,
        ...(props.borderColor ? { lineStyle: { color: props.borderColor } } : {}),
      },
      emphasis: {
        label: { show: props.showLabels ?? false },
      },
    }],
  };
}

export function buildRadarOption(props: BuilderProps): EChartsOption {
  const indicators = props.indicators?.length
    ? props.indicators
    : props.categories.map((name) => ({ name }));

  return {
    ...baseOption(props, 'item'),
    radar: { indicator: indicators },
    series: [{
      type: 'radar',
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
    series: [{
      type: 'gauge',
      name: first.name,
      min: props.minValue ?? 0,
      max: props.maxValue ?? 100,
      data,
      progress: { show: true },
      detail: {
        valueAnimation: props.enableAnimations !== false && props.enableAnimations !== 0,
        formatter: unitFormatter(props) ?? '{value}',
      },
    }],
  };
}

export function buildFunnelOption(props: BuilderProps): EChartsOption {
  const first = props.data[0] ?? { name: '', data: [] };
  return {
    ...baseOption(props, 'item'),
    series: [{
      type: 'funnel',
      name: first.name,
      min: props.minValue,
      max: props.maxValue,
      data: normalizePieData(first.data ?? [], props.categories),
      label: { show: props.showLabels ?? true },
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
    grid: { left: 60, right: 20, top: 40, bottom: 70 },
    xAxis: {
      type: 'category',
      data: props.categories,
      splitArea: { show: true },
    },
    yAxis: {
      type: 'category',
      data: props.yCategories ?? [],
      splitArea: { show: true },
    },
    visualMap: {
      min: props.minValue ?? heatmapExtent(data, 'min', 0),
      max: props.maxValue ?? heatmapExtent(data, 'max', 100),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
    },
    series: [{
      type: 'heatmap',
      name: first.name,
      data,
      label: { show: props.showLabels ?? false },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.35)',
        },
      },
    }],
  };
}

export function buildTreemapOption(props: BuilderProps): EChartsOption {
  const first = props.data[0] ?? { name: '', data: [] };
  return {
    ...baseOption(props, 'item'),
    series: [{
      type: 'treemap',
      name: first.name,
      data: first.data ?? [],
      label: { show: props.showLabels ?? true },
      upperLabel: { show: props.showLabels ?? true },
    }],
  };
}

export function buildSunburstOption(props: BuilderProps): EChartsOption {
  const first = props.data[0] ?? { name: '', data: [] };
  return {
    ...baseOption(props, 'item'),
    series: [{
      type: 'sunburst',
      name: first.name,
      data: first.data ?? [],
      radius: [props.innerRadius ?? 0, props.outerRadius ?? '90%'],
      label: { show: props.showLabels ?? true },
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
  const fallback = props.theme === 'dark' ? 'rgb(161, 161, 170)' : 'rgb(113, 113, 122)';
  const textColor = props.textColor ?? fallback;

  // Labels give each stage's share of what entered the flow, so the chart reads as a breakdown
  const targets = new Set(edges.map(edge => edge.target));
  const total = edges.filter(edge => !targets.has(edge.source)).reduce((sum, edge) => sum + edge.value, 0);
  const label = (p: { name: string; value?: unknown }) => !targets.has(p.name) || !total
    ? p.name
    : `${p.name}  {share|${(Number(p.value) / total * 100).toFixed(1)}%}`;

  const animEnabled = props.enableAnimations !== false && props.enableAnimations !== 0;
  const animDuration = typeof props.enableAnimations === 'number' ? props.enableAnimations : 1500;
  return {
    animation: animEnabled,
    animationDuration: animDuration,
    animationEasing: 'cubicOut',
    ...(props.colors ? { color: props.colors } : {}),
    textStyle: { color: textColor, fontFamily: props.fontFamily },
    tooltip: { trigger: 'item', appendTo: 'body', textStyle: { fontFamily: props.fontFamily }, valueFormatter: unitFormatter(props) },
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
