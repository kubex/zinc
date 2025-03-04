export type ZnBlurEvent = CustomEvent<Record<PropertyKey, never>>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-blur': ZnBlurEvent;
  }
}
