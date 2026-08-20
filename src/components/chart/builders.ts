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
  name: string;
  data: any[];
  color?: string;
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
    textStyle: { color: textColor },
    tooltip: {
      trigger: tooltipTrigger,
      appendTo: 'body',
      valueFormatter: props.yAxisAppend
        ? (v: number | string) => `${v}${props.yAxisAppend}`
        : undefined,
    },
    legend: {
      top: 0,
      right: 0,
      icon: 'circle',
      textStyle: { color: textColor },
    },
  };
}

function commonOption(props: BuilderProps): EChartsOption {
  return {
    ...baseOption(props, 'axis'),
    grid: {
      left: 40,
      right: 20,
      top: 40,
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
    axisLabel: props.yAxisAppend
      ? { formatter: (v: number) => `${v}${props.yAxisAppend}` }
      : {},
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
    ...(s.color ? { itemStyle: { color: s.color } } : {}),
    ...(props.stacked ? { stack: 'total' } : {}),
    ...(props.enableAnimations !== false && props.enableAnimations !== 0 && seriesType === 'bar'
      ? { animationDelay: (idx: number) => idx * 50 }
      : {}),
    ...extra(s),
  }));
}

export function buildBarOption(props: BuilderProps): EChartsOption {
  return {
    ...commonOption(props),
    xAxis: buildXAxis(props),
    yAxis: buildYAxis(props),
    series: seriesFromProps(props, 'bar'),
  };
}

export function buildLineOption(props: BuilderProps): EChartsOption {
  return {
    ...commonOption(props),
    xAxis: buildXAxis(props, true),
    yAxis: buildYAxis(props),
    series: seriesFromProps(props, 'line', () => ({
      symbolSize: props.datapointSize,
      smooth: props.smooth,
    })),
  };
}

export function buildAreaOption(props: BuilderProps): EChartsOption {
  return {
    ...commonOption(props),
    xAxis: buildXAxis(props, true),
    yAxis: buildYAxis(props),
    series: seriesFromProps(props, 'line', () => ({
      symbolSize: props.datapointSize,
      smooth: props.smooth,
      areaStyle: { opacity: 0.1 },
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
        formatter: props.yAxisAppend
          ? (value: number) => `${value}${props.yAxisAppend}`
          : '{value}',
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

export function buildSankeyOption(props: BuilderProps): EChartsOption {
  const first = props.data[0] ?? { name: '', data: [] };
  const edges = (first.data ?? []) as SankeyEdge[];
  const explicitNodes = (first as { nodes?: { name: string }[] }).nodes;
  const nodes = explicitNodes ?? deriveNodes(edges);
  const fallback = props.theme === 'dark' ? 'rgb(161, 161, 170)' : 'rgb(113, 113, 122)';
  const textColor = props.textColor ?? fallback;

  const animEnabled = props.enableAnimations !== false && props.enableAnimations !== 0;
  const animDuration = typeof props.enableAnimations === 'number' ? props.enableAnimations : 1500;
  return {
    animation: animEnabled,
    animationDuration: animDuration,
    animationEasing: 'cubicOut',
    ...(props.colors ? { color: props.colors } : {}),
    textStyle: { color: textColor },
    tooltip: { trigger: 'item', appendTo: 'body' },
    series: [{
      type: 'sankey',
      name: first.name,
      data: nodes,
      links: edges,
      label: {
        color: textColor,
        textBorderWidth: 0,
      },
      lineStyle: {
        color: 'source',
        opacity: props.theme === 'dark' ? 0.4 : 0.3,
      },
      emphasis: { focus: 'adjacency' },
    }],
  };
}
