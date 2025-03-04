export type ZnInitialFocusEvent = CustomEvent<Record<PropertyKey, never>>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-initial-focus': ZnInitialFocusEvent;
  }
}
