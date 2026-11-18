export type ZnChartZoomEvent = CustomEvent<{
  /** The range's first x-axis value: a category label on a category axis, or null when the whole data set shows. */
  from: string | number | null;
  to: string | number | null;
}>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-chart-zoom': ZnChartZoomEvent;
  }
}
