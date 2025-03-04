export type ZnCancelEvent = CustomEvent<Record<PropertyKey, never>>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-cancel': ZnCancelEvent;
  }
}
