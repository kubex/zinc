import './headless-emoji.component';
import {html} from 'lit';
import {init, SearchIndex} from 'emoji-mart';
import {litToHTML} from '../../../../../utilities/lit-to-html';
import data from '@emoji-mart/data';
import Quill from 'quill';
import type {EmojiResult} from "../emoji";
import type {ResultItem} from './headless-emoji.component';
import type HeadlessEmojiComponent from './headless-emoji.component';

class HeadlessEmoji {
  private _quill: Quill;
  private _component!: HeadlessEmojiComponent;
  private _startIndex = -1;
  private _keydownHandler = (e: KeyboardEvent) => this.onKeydown(e);
  private _docClickHandler = (e: MouseEvent) => this.onDocumentClick(e);

  constructor(quill: Quill) {
    this._quill = quill;
    // Initialize emoji-mart index once
    try {
      void init({data});
    } catch {
      // no-op
    }

    this.initComponent();
    this.attachEvents();
  }

  private initComponent() {
    this._component = this.createComponent()!;
    this._quill.container.ownerDocument.body.appendChild(this._component);
  }

  private attachEvents() {
    this._quill.on(Quill.events.TEXT_CHANGE, () => this.updateFromEditor());
    this._quill.on(Quill.events.SELECTION_CHANGE, () => this.updateFromEditor());
    this._quill.root.addEventListener('keydown', this._keydownHandler);
    this._component.addEventListener('zn-emoji-select', (e: Event) => this.onEmojiSelect(e as CustomEvent));
    this._quill.on('editor-change', () => this.positionComponent());
    this._quill.focus();
  }

  private createComponent() {
    const tpl = html`
      <zn-headless-emoji></zn-headless-emoji>`;
    return litToHTML<HeadlessEmojiComponent>(tpl);
  }

  private onDocumentClick(e: MouseEvent) {
    const target = e.composedPath ? e.composedPath()[0] as Node : (e.target as Node);
    if (!target) return;

    if (!this._component.contains(target) && !this._quill.root.contains(target)) {
      this.hide();
    }
  }

  private async updateFromEditor() {
    const info = this.getEmojiQuery();
    if (!info) {
      this.hide();
      return;
    }

    const {start, emojiQuery} = info;
    this._startIndex = start;

    try {
      const results = await SearchIndex.search(emojiQuery) as EmojiResult[];
      const mapped: ResultItem[] = (Array.isArray(results) ? results : []).slice(0, 20).map((e) => ({
        emojiChar: (e?.skins?.[0]?.native) || e?.native || '',
        label: (e?.id || e?.shortcodes || '') || ''
      })).filter(it => !!it.emojiChar);

      this._component.results = mapped;
      this._component.query = emojiQuery;
      if (mapped.length > 0) {
        this.show();
        this.positionComponent();
      } else {
        this.show();
        this.positionComponent();
      }
    } catch {
      this._component.results = [];
      this._component.query = emojiQuery;
      this.show();
      this.positionComponent();
    }
  }

  private positionComponent() {
    if (!this._component || !this._component.open) return;

    const range = this._quill.getSelection();
    if (!range) return;

    const bounds = this._quill.getBounds(range.index);
    if (!bounds) return;

    const editorBounds = this._quill.container.getBoundingClientRect();
    const left = editorBounds.left + Math.max(0, bounds.left);
    const top = editorBounds.top + bounds.bottom + 4;
    this._component.setPosition(left, top);
  }

  private getEmojiQuery(): { start: number; emojiQuery: string } | null {
    try {
      const sel = this._quill.getSelection();
      if (!sel) return null;

      const cursor = sel.index;
      const characterLimit = 50;
      const textBefore = this._quill.getText(Math.max(0, cursor - characterLimit), Math.min(characterLimit, cursor));
      const offset = cursor - Math.max(0, cursor - characterLimit);
      const uptoCursor = textBefore.slice(0, offset);
      const cIndex = uptoCursor.lastIndexOf(':');
      if (cIndex === -1) return null;

      const prev = cIndex > 0 ? uptoCursor[cIndex - 1] : ' ';
      if (prev && /[^\s\n]/.test(prev)) return null; // must start at word boundary

      const emojiQuery = uptoCursor.substring(cIndex + 1);
      if (/[\s\n]/.test(emojiQuery)) return null; // stop at whitespace

      // Do not trigger for URLs like http://
      if (/^\/\//.test(uptoCursor.substring(Math.max(0, cIndex - 5), cIndex + 1))) return null;
      return {start: cursor - emojiQuery.length - 1, emojiQuery};
    } catch {
      return null;
    }
  }

  private onKeydown(e: KeyboardEvent) {
    if (!this._component?.open) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      this.hide();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
      const next = (this._component.getActiveIndex?.() ?? -1) + 1;
      this._component.setActiveIndex?.(next);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      const prev = (this._component.getActiveIndex?.() ?? 0) - 1;
      this._component.setActiveIndex?.(prev);
      return;
    }

    if (e.key === 'Enter') {
      const idx = this._component.getActiveIndex?.();
      const results = this._component.results || [];
      const item = (typeof idx === 'number' && idx >= 0 && idx < results.length) ? results[idx] : undefined;
      if (item) {
        e.preventDefault();
        e.stopPropagation();
        this.replaceAtQuery(item.emojiChar);
      }
    }
  }

  private onEmojiSelect(e: CustomEvent) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const emojiChar: string = e.detail?.emojiChar || '';
    if (!emojiChar) return;
    this.replaceAtQuery(emojiChar);
  }

  private replaceAtQuery(emojiChar: string) {
    try {
      const sel = this._quill.getSelection();
      if (!sel || this._startIndex < 0) return;

      const insertIndex = this._startIndex;
      const length = sel.index - insertIndex;
      if (length < 0) return;

      // Remove ':' and the query
      this._quill.deleteText(insertIndex, length, 'user');

      const insertText = `${emojiChar} `;
      this._quill.insertText(insertIndex, insertText, 'user');

      const cursorPos = insertIndex + insertText.length;
      setTimeout(() => this._quill.setSelection(cursorPos, 0, 'silent'), 0);
      this._quill.focus();
      this.hide();
    } catch {
      // no-op
    }
  }

  private show() {
    if (!this._component.open) {
      this._component.show();
      this._quill.container.ownerDocument.addEventListener('click', this._docClickHandler);
    }
  }

  private hide() {
    this._component.hide();
    this._startIndex = -1;
    this._quill.container.ownerDocument.removeEventListener('click', this._docClickHandler);
  }
}

export default HeadlessEmoji;
