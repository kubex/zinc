export type ZincElementAddedEvent = CustomEvent<{ element: HTMLElement }>;

declare global
{
  interface GlobalEventHandlersEventMap
  {
    'zn-element-added': ZincElementAddedEvent;
  }
}
