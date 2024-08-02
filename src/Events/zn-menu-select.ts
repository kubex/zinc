export type ZincMenuSelectEvent = CustomEvent<{ value: string, element: HTMLElement }>;

declare global
{
  interface GlobalEventHandlersEventMap
  {
    'zn-menu-select': ZincMenuSelectEvent;
  }
}
