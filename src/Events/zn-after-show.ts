export type ZincAfterShowEvent = CustomEvent<{ element: Element }>;

declare global
{
  interface GlobalEventHandlersEventMap
  {
    'zn-after-show': ZincAfterShowEvent;
  }
}
