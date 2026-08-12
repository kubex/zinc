import type {SlashMenuItem} from "../components/slash-menu/slash-menu-items";

export type ZnSlashSelectEvent = CustomEvent<{ item: SlashMenuItem; query: string }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-slash-select': ZnSlashSelectEvent;
  }
}
