export type ZnHoverEvent = CustomEvent<{
  phase: 'start' | 'move' | 'end';
  value: number;
}>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-hover': ZnHoverEvent;
  }
}
