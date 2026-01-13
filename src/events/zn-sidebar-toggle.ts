export type ZnSidebarToggleEvent = CustomEvent<{ element: Element; open: boolean }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-sidebar-toggle': ZnSidebarToggleEvent;
  }
}
