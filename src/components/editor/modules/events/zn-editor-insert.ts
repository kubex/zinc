export type ZnEditorInsertEvent = CustomEvent<{
  mode: 'insert' | 'replace';
  text?: string;
  html?: string;
}>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-editor-insert': ZnEditorInsertEvent;
  }
}
