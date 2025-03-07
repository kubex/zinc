import type ZnMenuItem from "../components/menu-item";

export type ZnSelectEvent = CustomEvent<{ item: ZnMenuItem }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-select': ZnSelectEvent;
  }
}
