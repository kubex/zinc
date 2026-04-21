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
  enableAnimations: boolean;
  datapointSize: number;
  colors?: string[];
  theme: 'light' | 'dark';
}

function commonOption(props: BuilderProps): EChartsOption {
  return {
    animation: props.enableAnimations,
    ...(props.colors ? { color: props.colors } : {}),
    tooltip: {
      trigger: 'axis',
      valueFormatter: props.yAxisAppend
        ? (v: number | string) => `${v}${props.yAxisAppend}`
        : undefined,
    },
    legend: {
      top: 0,
      right: 0,
    },
    grid: {
      left: 40,
      right: 20,
      top: 40,
      bottom: 30,
    },
  };
}

function buildYAxis(props: BuilderProps) {
  return {
    type: 'value' as const,
    axisLabel: props.yAxisAppend
      ? { formatter: (v: number) => `${v}${props.yAxisAppend}` }
      : {},
  };
}

function buildXAxis(props: BuilderProps) {
  if (props.xAxisType === 'datetime') return { type: 'time' as const };
  if (props.xAxisType === 'numeric') return { type: 'value' as const };
  return { type: 'category' as const, data: props.categories };
}

function seriesFromProps(
  props: BuilderProps,
  seriesType: 'bar' | 'line',
  extra: (s: SeriesItem) => Record<string, unknown> = () => ({}),
) {
  return props.data.map((s) => ({
    type: seriesType,
    name: s.name,
    data: s.data,
    ...(s.color ? { itemStyle: { color: s.color } } : {}),
    ...(props.stacked ? { stack: 'total' } : {}),
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
    xAxis: buildXAxis(props),
    yAxis: buildYAxis(props),
    series: seriesFromProps(props, 'line', () => ({
      symbolSize: props.datapointSize,
    })),
  };
}

export function buildAreaOption(props: BuilderProps): EChartsOption {
  return {
    ...commonOption(props),
    xAxis: buildXAxis(props),
    yAxis: buildYAxis(props),
    series: seriesFromProps(props, 'line', () => ({
      symbolSize: props.datapointSize,
      areaStyle: {},
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

  return {
    animation: props.enableAnimations,
    ...(props.colors ? { color: props.colors } : {}),
    tooltip: { trigger: 'item' },
    series: [{
      type: 'sankey',
      name: first.name,
      data: nodes,
      links: edges,
      emphasis: { focus: 'adjacency' },
    }],
  };
}