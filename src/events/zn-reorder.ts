export type ZnReorderEvent = CustomEvent<Record<PropertyKey, never>>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-reorder': ZnReorderEvent;
  }
}
