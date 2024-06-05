export type ZincCloseEvent = CustomEvent<{ element: Element }>;

declare global
{
  interface GlobalEventHandlersEventMap
  {
    'zn-close': ZincCloseEvent;
  }
}
