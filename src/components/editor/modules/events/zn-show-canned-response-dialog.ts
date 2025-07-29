export type ZnShowCannedResponseDialogEvent = CustomEvent<{
  commands: {
    title: string;
    content: string;
    command: string;
    labels?: string[];
  }[];
}>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-show-canned-response-dialog': ZnShowCannedResponseDialogEvent;
  }
}
