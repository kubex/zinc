// src/components/chart/builders.ts
import type { EChartsOption } from 'echarts';

export type ChartType = 'area' | 'bar' | 'line' | 'sankey';

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
}

function commonOption(props: BuilderProps): EChartsOption {
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
      trigger: 'axis',
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
  seriesType: 'bar' | 'line',
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
    tooltip: { trigger: 'item' },
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
