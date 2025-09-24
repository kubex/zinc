import {init, Picker} from 'emoji-mart';
import data from '@emoji-mart/data';
import type Quill from 'quill';

export interface Emoji {
  native?: string;
  skins?: { native?: string }[];
  id?: string;
  shortcodes?: string;
}

class EmojiModule {
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

  private getToolbarEmojiContainer(): HTMLElement | null {
    try {
      const root = this._quill.container?.getRootNode?.() as ShadowRoot | null;
      if (!root) return null;

      const toolbar = root.getElementById?.('toolbar') as HTMLElement | null;
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
    const container = this.getToolbarEmojiContainer();
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
      onEmojiSelect: (emoji: Emoji) => this.onEmojiSelect(emoji)
    });
  }

  private onEmojiSelect(emoji: Emoji | null) {
    try {
      const text: string = (emoji?.native) ?? (emoji?.skins?.[0]?.native) ?? '';
      if (!text || !this._quill) return;

      const range = this._quill.getSelection(true);
      if (range) {
        this._quill.insertText(range.index, text, 'user');
        this._quill.setSelection(range.index + text.length, 0, 'user');
      } else {
        const index = Math.max(0, this._quill.getLength() - 1);
        this._quill.insertText(index, text, 'user');
        this._quill.setSelection(index + text.length, 0, 'user');
      }
    } catch {
      // no-op
    }
  }
}

export default EmojiModule;
