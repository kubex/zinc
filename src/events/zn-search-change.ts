export type ZnSearchChangeEvent = CustomEvent<{
  value: string;
  formData: Record<string, any>;
  searchUri?: string;
}>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-search-change': ZnSearchChangeEvent;
  }
}
