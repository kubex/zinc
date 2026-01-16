export type ZnRedirectEvent = CustomEvent<{ url: string }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-redirect': ZnRedirectEvent;
  }
}
