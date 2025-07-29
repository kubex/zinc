export type ZnMenuReadyEvent = CustomEvent<{ value: string; element: HTMLElement }>;

declare global
{
  interface GlobalEventHandlersEventMap
  {
    'zn-menu-ready': ZnMenuReadyEvent;
  }
}
