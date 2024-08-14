export type ZincHideEvent = CustomEvent<{ element: Element }>;

declare global
{
  interface GlobalEventHandlersEventMap
  {
    'zn-hide': ZincHideEvent;
  }
}
