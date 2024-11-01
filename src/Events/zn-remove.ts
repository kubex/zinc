export type ZnRemoveEvent = CustomEvent<Record<PropertyKey, never>>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-remove': ZnRemoveEvent;
  }
}
