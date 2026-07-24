export type ZnErrorEvent = CustomEvent<{ status?: number; message?: string }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-error': ZnErrorEvent;
  }
}
