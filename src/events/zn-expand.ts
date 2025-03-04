export type ZnExpandEvent = CustomEvent<Record<PropertyKey, never>>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-expand': ZnExpandEvent;
  }
}
