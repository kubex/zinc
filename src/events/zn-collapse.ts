export type ZnCollapseEvent = CustomEvent<Record<PropertyKey, never>>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-collapse': ZnCollapseEvent;
  }
}
