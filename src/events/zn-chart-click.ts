export type ZnChartClickEvent = CustomEvent<{
  seriesName: string;
  /** The clicked category, or the data item's name. */
  name: string;
  dataIndex: number;
  value: unknown;
}>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-chart-click': ZnChartClickEvent;
  }
}
