export type ZnFilterChangeEvent = CustomEvent<Record<PropertyKey, never>>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-filter-change': ZnFilterChangeEvent;
  }
}
