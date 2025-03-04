export type ZnElementAddedEvent = CustomEvent<{ element: Element }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-element-added': ZnElementAddedEvent;
  }
}
