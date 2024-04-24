export type ZincSubmitEvent = CustomEvent<{ value: string }>;

declare global
{
  interface GlobalEventHandlersEventMap
  {
    'zn-submit': ZincSubmitEvent;
  }
}
