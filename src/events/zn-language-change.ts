export type ZnLanguageChangeEvent = CustomEvent<{ language: string }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-language-change': ZnLanguageChangeEvent;
  }
}
