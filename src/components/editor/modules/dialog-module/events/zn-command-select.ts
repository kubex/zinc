export type ZnCommandSelectEvent = CustomEvent<{ item: HTMLElement }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-command-select': ZnCommandSelectEvent;
  }
}
