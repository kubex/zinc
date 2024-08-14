export type ZincAfterHideEvent = CustomEvent<{ element: Element }>;

declare global
{
  interface GlobalEventHandlersEventMap
  {
    'zn-after-hide': ZincAfterHideEvent;
  }
}
