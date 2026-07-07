export type ZnPageSelectionChangeEvent = CustomEvent<{ sectionId: string | null }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-page-selection-change': ZnPageSelectionChangeEvent;
  }
}
