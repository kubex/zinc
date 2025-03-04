export type ZnErrorEvent = CustomEvent<{ status?: number }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-error': ZnErrorEvent;
  }
}
