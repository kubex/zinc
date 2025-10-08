import {init, Picker} from 'emoji-mart';
import data from '@emoji-mart/data';
import Quill from 'quill';
import type ToolbarComponent from "../toolbar/toolbar.component";
import type ZnDialog from "../../../dialog";

export interface EmojiResult {
  native?: string;
  skins?: { native?: string }[];
  id?: string;
  shortcodes?: string;
}

class Emoji {
  private readonly _quill: Quill;
  private _mo: MutationObserver | null = null;

  constructor(quill: Quill) {
    this._quill = quill;
    try {
      void init({data});
    } catch {
      // no-op if already initialised
    }
    this.initPicker();

    const host = this.getHostEditor();
    if (host) {
      this._mo = new MutationObserver(() => this.initPicker());
      this._mo.observe(host, {attributes: true, attributeFilter: ['t']});
    }
  }

  private getHostEditor(): HTMLElement | null {
    const root = this._quill.container?.getRootNode?.() as ShadowRoot | null;
    return (root && (root as ShadowRoot).host) as HTMLElement | null;
  }

  private async getToolbarEmojiContainer(): Promise<HTMLElement | null> {
    try {
      const root = this._quill.container?.getRootNode?.() as ShadowRoot | null;
      if (!root) return null;

      const toolbar = root.getElementById?.('toolbar') as ToolbarComponent | null;
      await toolbar?.updateComplete;

      const shadow = toolbar?.shadowRoot as ShadowRoot | undefined;
      const container = shadow?.querySelector?.('.emoji-picker') as HTMLElement | null;
      return container ?? null;
    } catch {
      return null;
    }
  }

  private getTheme(): 'light' | 'dark' {
    const host: any = this.getHostEditor();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    const t = host?.t ?? host?.getAttribute?.('t');
    return t === 'dark' ? 'dark' : 'light';
  }

  private initPicker() {
    this.getToolbarEmojiContainer().then((container) => {
      if (!container) return;

      container.innerHTML = '';

      // eslint-disable-next-line no-new
      new Picker({
        parent: container,
        data: data as Record<string, unknown>,
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
    try {
      const text: string = (emoji?.native) ?? (emoji?.skins?.[0]?.native) ?? '';
      if (!text || !this._quill) return;

      const range = this._quill.getSelection(true);
      if (range) {
        this._quill.insertText(range.index, text, Quill.sources.USER);
        this._quill.setSelection(range.index + text.length, 0, Quill.sources.USER);
      } else {
        const index = Math.max(0, this._quill.getLength() - 1);
        this._quill.insertText(index, text, Quill.sources.USER);
        this._quill.setSelection(index + text.length, 0, Quill.sources.USER);
      }

      this.getToolbarEmojiContainer().then((container) => {
        const dialog = container?.parentElement as ZnDialog;
        if (dialog) {
          dialog.hide();
        }
      });
    } catch {
      // no-op
    }
  }
}

export default Emoji;
