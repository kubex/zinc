export type ZincChangeEvent = CustomEvent<Record<PropertyKey, never>>;

declare global
{
  interface GlobalEventHandlersEventMap
  {
    'zn-change': ZincChangeEvent;
  }
}
