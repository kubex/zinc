export type ZnAcceptEvent = CustomEvent<{ fid: string; acceptUri: string }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-accept': ZnAcceptEvent;
  }
}
