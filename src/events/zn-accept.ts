export type ZnAcceptEvent = CustomEvent<{ itemId: string; acceptUri: string }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-accept': ZnAcceptEvent;
  }
}
