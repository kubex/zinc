/**
 * Dispatched (composed, bubbling) by editor-dialog content that renders its
 * own header row, including a [dialog-closer] control. The dialog responds by
 * removing its floating chrome close button so content doesn't need to
 * reserve space for it.
 */
export type ZnDialogHeaderEvent = CustomEvent<void>;

declare global {
  interface GlobalEventHandlersEventMap {
    'zn-dialog-header': ZnDialogHeaderEvent;
  }
}
