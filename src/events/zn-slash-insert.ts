import type {SlashMenuItem} from "../components/slash-menu";

export type ZnSlashInsertEvent = CustomEvent<{ item: SlashMenuItem; value: string }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-slash-insert': ZnSlashInsertEvent;
  }
}
