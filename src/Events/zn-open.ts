export type ZincOpenEvent = CustomEvent<{ element: Element }>;

declare global
{
  interface GlobalEventHandlersEventMap
  {
    'zn-open': ZincOpenEvent;
  }
}
