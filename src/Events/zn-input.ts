export type ZincInputEvent = CustomEvent<Record<PropertyKey, never>>;

declare global
{
  interface GlobalEventHandlersEventMap
  {
    'zn-input': ZincInputEvent;
  }
}
