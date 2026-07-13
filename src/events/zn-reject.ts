export type ZnRejectEvent = CustomEvent<{ itemId: string; variant: string }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-reject': ZnRejectEvent;
  }
}
