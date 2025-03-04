export type ZnCloseEvent = CustomEvent<{ element: Element }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-close': ZnCloseEvent;
  }
}
