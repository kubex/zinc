export type ZincSubmitEvent = CustomEvent<{ value: string }>;

declare global
{
  interface GlobalEventHandlersEventMap
  {
    'zc-submit': ZincSubmitEvent;
  }
}
