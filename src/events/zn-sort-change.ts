export type ZnSortChangeEvent = CustomEvent<Record<PropertyKey, never>>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-sort-change': ZnSortChangeEvent;
  }
}
