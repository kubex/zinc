export type ZnCopyEvent = CustomEvent<{ value: string }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-copy': ZnCopyEvent;
  }
}
