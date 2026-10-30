export type ZnThemeSubmitEvent = CustomEvent<{
  values: {light: Record<string, unknown>; dark: Record<string, unknown>};
}>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-theme-submit': ZnThemeSubmitEvent;
  }
}
