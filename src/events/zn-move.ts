export type ZnMoveEvent = CustomEvent<{
  item: HTMLElement;
  from: HTMLElement;
  to: HTMLElement;
  index: number;
}>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-move': ZnMoveEvent;
  }
}
