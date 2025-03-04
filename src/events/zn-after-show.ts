export type ZnAfterShowEvent = CustomEvent<Record<PropertyKey, never>>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-after-show': ZnAfterShowEvent;
  }
}
