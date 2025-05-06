export type ZnSubmitEvent = CustomEvent<{ value: string; element: HTMLElement }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-submit': ZnSubmitEvent;
  }
}
