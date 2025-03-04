export type ZnOpenEvent = CustomEvent<{ element: Element }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-open': ZnOpenEvent;
  }
}
