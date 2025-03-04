export type ZnInvalidEvent = CustomEvent<Record<PropertyKey, never>>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-invalid': ZnInvalidEvent;
  }
}
