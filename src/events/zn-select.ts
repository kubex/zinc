export type ZnSelectEvent = CustomEvent<{ element: Element }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-select-added': ZnSelectEvent;
  }
}
