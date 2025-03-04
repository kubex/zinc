export type ZnAfterHideEvent = CustomEvent<Record<PropertyKey, never>>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-after-hide': ZnAfterHideEvent;
  }
}
