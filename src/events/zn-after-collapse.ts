export type ZnAfterExpandEvent = CustomEvent<Record<PropertyKey, never>>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-after-expand': ZnAfterExpandEvent;
  }
}
