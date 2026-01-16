export type ZnPurchaseEvent = CustomEvent<{
  value: string;
  setSuccess: () => void;
  setFailure: (message?: string) => void;
}>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-purchase': ZnPurchaseEvent;
  }
}
