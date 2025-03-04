export type ZnMenuSelectEvent = CustomEvent<{ value: string, element: HTMLElement }>;

declare global
{
  interface GlobalEventHandlersEventMap
  {
    'zn-menu-select': ZnMenuSelectEvent;
  }
}
