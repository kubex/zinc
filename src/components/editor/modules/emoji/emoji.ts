import {loadEmojiMart} from './emoji-mart-loader';
import type {EditorHost, PickerModule} from '../host';
import type RichEditor from '../../../../internal/rich-text/rich-editor';

export interface EmojiResult {
  native?: string;
  skins?: { native?: string }[];
  id?: string;
  shortcodes?: string;
}

/** The emoji picker. It opens in the editor's picker popup and inserts the chosen emoji at the caret. */
class Emoji implements PickerModule {
  readonly element = document.createElement('div');
  private readonly _editor: RichEditor;
  private readonly _host: EditorHost;

  constructor(host: EditorHost) {
    this._editor = host.editor;
    this._host = host;
    this.initPicker();

    // Rebuilt when the page switches mode, as the picker takes its theme once
    const editorElement = this._hostElement();
    if (editorElement) {
      new MutationObserver(() => this.initPicker()).observe(editorElement, {attributes: true, attributeFilter: ['t', 'm']});
    }
  }

  private _hostElement(): HTMLElement | null {
    const root = this._host.container.getRootNode();
    return root instanceof ShadowRoot ? root.host as HTMLElement : null;
  }

  // `m` is the rendered mode the editor mirrors from the page; older pages set `t="dark"` instead
  private getTheme(): 'light' | 'dark' {
    const host = this._hostElement();
    return host?.getAttribute('m') === 'dark' || host?.getAttribute('t') === 'dark' ? 'dark' : 'light';
  }

  public initPicker() {
    loadEmojiMart().then(({Picker, data}) => {
      this.element.replaceChildren();
      // eslint-disable-next-line no-new
      new Picker({
        parent: this.element,
        data,
        previewPosition: 'none',
        skinTonePosition: 'none',
        theme: this.getTheme(),
        set: 'native',
        icons: 'solid',
        onEmojiSelect: (emoji: EmojiResult) => this.onEmojiSelect(emoji)
      });
    });
  }

  private onEmojiSelect(emoji: EmojiResult | null) {
    const text: string = (emoji?.native) ?? (emoji?.skins?.[0]?.native) ?? '';
    if (!text) return;

    const range = this._editor.getSelection(true)!;
    this._editor.insertText(range.index, text);
    this._editor.setSelection(range.index + text.length, 0);
    this._host.closePicker();
  }
}

export default Emoji;
