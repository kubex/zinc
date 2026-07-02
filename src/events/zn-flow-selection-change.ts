export type ZnFlowSelectionChangeEvent = CustomEvent<{ nodeId: string | null }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-flow-selection-change': ZnFlowSelectionChangeEvent;
  }
}
