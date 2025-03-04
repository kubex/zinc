export type ZnAfterCollapseEvent = CustomEvent<Record<PropertyKey, never>>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-after-collapse': ZnAfterCollapseEvent;
  }
}
