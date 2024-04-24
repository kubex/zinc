export type ZincElementAddedEvent = CustomEvent<{ element: HTMLElement }>;

declare global
{
  interface GlobalEventHandlersEventMap
  {
    'zc-element-added': ZincElementAddedEvent;
  }
}
