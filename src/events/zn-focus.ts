export type ZnFocusEvent = CustomEvent<Record<PropertyKey, never>>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-focus': ZnFocusEvent;
  }
}
