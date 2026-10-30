import type {SlashMenuItem} from "../components/slash-menu";

export type ZnSlashSelectEvent = CustomEvent<{ item: SlashMenuItem; query: string }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-slash-select': ZnSlashSelectEvent;
  }
}
