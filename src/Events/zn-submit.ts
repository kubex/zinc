export type ZincSubmitEvent = CustomEvent<{ value: string, element: HTMLElement }>;

declare global
{
  interface GlobalEventHandlersEventMap
  {
    'zn-submit': ZincSubmitEvent;
  }
}
