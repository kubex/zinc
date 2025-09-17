export type ZnShowCannedResponseMenuEvent = CustomEvent<{
  commands: {
    title: string;
    content: string;
    command: string;
    count: string;
    labels?: string[];
  }[];
}>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-show-canned-response-menu': ZnShowCannedResponseMenuEvent;
  }
}
