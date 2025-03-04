export type ZnFinishEvent = CustomEvent<Record<PropertyKey, never>>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-finish': ZnFinishEvent;
  }
}
