export type ZnRequestCloseEvent = CustomEvent<{ source: 'close-button' | 'keyboard' | 'overlay' }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-request-close': ZnRequestCloseEvent;
  }
}
