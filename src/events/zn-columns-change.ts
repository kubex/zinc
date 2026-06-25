export type ZnColumnsChangeEvent = CustomEvent<{ columns: string[] }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-columns-change': ZnColumnsChangeEvent;
  }
}
