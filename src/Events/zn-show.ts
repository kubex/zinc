export type ZincShowEvent = CustomEvent<{ element: Element }>;

declare global
{
  interface GlobalEventHandlersEventMap
  {
    'zn-show': ZincShowEvent;
  }
}
