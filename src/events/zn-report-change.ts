export type ZnReportChangeEvent = CustomEvent<{type: string; groupBy: string; from: string; to: string; filter: string}>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-report-change': ZnReportChangeEvent;
  }
}
