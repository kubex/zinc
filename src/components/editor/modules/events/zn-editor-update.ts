export type ZnEditorUpdateEvent = CustomEvent<Record<PropertyKey, never>>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-editor-update': ZnEditorUpdateEvent;
  }
}
