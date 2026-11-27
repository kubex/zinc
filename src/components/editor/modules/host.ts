import type RichEditor from '../../../internal/rich-text/rich-editor';

/** What a module gets from zn-editor: the editing core, the box around the content and its sibling modules. */
export interface EditorHost {
  editor: RichEditor;
  /** The box around the content, which modules mount their own UI into. */
  container: HTMLElement;
  getModule: <T>(name: string) => T | undefined;
  /** Shows a picker's element in the editor's popup beside `anchor`, or beside the caret without one. */
  openPicker: (element: HTMLElement, anchor?: Element) => void;
  closePicker: () => void;
}

/** A module whose UI opens in the editor's picker popup, such as the date and emoji pickers. */
export interface PickerModule {
  readonly element: HTMLElement;
}

/** Calls `listener` after every edit and every selection move. */
export function onEditorChange(editor: RichEditor, listener: () => void) {
  editor.addEventListener('change', listener);
  editor.addEventListener('selection-change', listener);
}
