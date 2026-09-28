export type ZnRepositionEvent = CustomEvent<Record<PropertyKey, never>>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-reposition': ZnRepositionEvent;
  }
}
