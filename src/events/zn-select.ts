import type ZnMenuItem from "../components/menu-item";

export type ZnSelectEvent = CustomEvent<{ item: ZnMenuItem | HTMLElement }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-select': ZnSelectEvent;
  }
}
