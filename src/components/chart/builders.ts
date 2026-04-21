// src/components/chart/builders.ts

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