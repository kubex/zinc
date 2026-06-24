export type ZnRejectEvent = CustomEvent<{ fid: string; variant: string }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-reject': ZnRejectEvent;
  }
}
