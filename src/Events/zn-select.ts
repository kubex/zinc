export type ZincSelectEvent = CustomEvent<{ element: Element }>;

declare global
{
  interface GlobalEventHandlersEventMap
  {
    'zn-select': ZincSelectEvent;
  }
}
