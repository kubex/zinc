import './context-menu-component';
import {html} from "lit";
import {litToHTML} from "../../../../utilities/lit-to-html";
import {type ResultItem} from "./context-menu-component";
import Quill from "quill";
import type {Commands} from "../../editor.component";
import type ContextMenuComponent from "./context-menu-component";
import type Toolbar from "quill/modules/toolbar";

class ContextMenu {
  private _quill: Quill;
  private readonly _toolbarModule: Toolbar;
  private readonly _commands: Commands[] = [];
  private _component!: ContextMenuComponent;
  private _startIndex = -1;
  private _keydownHandler = (e: KeyboardEvent) => this.onKeydown(e);
  private _docClickHandler = (e: MouseEvent) => this.onDocumentClick(e);

  constructor(quill: Quill, options: { commands: Commands[] }) {
    this._quill = quill;
    this._toolbarModule = quill.getModule('toolbar') as Toolbar;
    const commands = options.commands || [];
    this._commands = commands
      .sort((a, b) => parseInt(b.count) - parseInt(a.count))
      .slice(0, 3);

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
    this._component.addEventListener('zn-format-select', (e: Event) => this.onToolbarSelect(e as CustomEvent));
    this._quill.on('editor-change', () => this.positionComponent());
    this._quill.focus();
  }

  private createComponent() {
    const tpl = html`
      <zn-context-menu></zn-context-menu>`;
    return litToHTML<ContextMenuComponent>(tpl);
  }

  private onDocumentClick(e: MouseEvent) {
    const target = e.composedPath ? e.composedPath()[0] as Node : (e.target as Node);
    if (!target) return;

    if (!this._component.contains(target) && !this._quill.root.contains(target)) {
      this.hide();
    }
  }

  private updateFromEditor() {
    const info = this.getToolbarQuery();
    if (!info) {
      this.hide();
      return;
    }

    const {start, formatQuery} = info;
    this._startIndex = start;

    try {
      const q = formatQuery.toLowerCase();
      this._component.results = this._getOptions().filter(it => !q || it.label.toLowerCase().includes(q) || it?.format?.toLowerCase().includes(q));
    } catch {
      this._component.results = [];
    }

    this._component.query = formatQuery;
    this.show();
    this.positionComponent();
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

  private getToolbarQuery(): { start: number; formatQuery: string } | null {
    try {
      const sel = this._quill.getSelection();
      if (!sel) return null;

      const cursor = sel.index;
      const characterLimit = 50;
      const textBefore = this._quill.getText(Math.max(0, cursor - characterLimit), Math.min(characterLimit, cursor));
      const offset = cursor - Math.max(0, cursor - characterLimit);
      const uptoCursor = textBefore.slice(0, offset);
      const cIndex = uptoCursor.lastIndexOf('/');
      if (cIndex === -1) return null;

      const prev = cIndex > 0 ? uptoCursor[cIndex - 1] : ' ';
      if (prev && /[^\s\n]/.test(prev)) return null; // must start at word boundary

      const formatQuery = uptoCursor.substring(cIndex + 1);
      if (/[\s\n]/.test(formatQuery)) return null; // stop at whitespace

      return {start: cursor - formatQuery.length - 1, formatQuery};
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
      const results = (this._component.results as ResultItem[]) || [];
      const item = (typeof idx === 'number' && idx >= 0 && idx < results.length) ? results[idx] : undefined;
      if (item?.module === 'dialog') {
        e.preventDefault();
        e.stopPropagation();
        this.showDialog();
        return;
      }
      if (item?.format) {
        e.preventDefault();
        e.stopPropagation();
        this._applySelectedFormat(item.format, item.value);
      }
    }
  }

  private showDialog() {
    this.hide();

    const toolbar = this._toolbarModule.container;
    if (!toolbar) return;

    const button = toolbar.shadowRoot?.querySelector('[data-format="canned-responses"]') as HTMLElement | null;
    if (!button) return;

    button.click();
  }

  private onToolbarSelect(e: CustomEvent) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const module: string | undefined = e.detail?.module as (string | undefined);

    if (module === 'dialog') {
      this.showDialog();
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const format: string = e.detail?.format || '';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const value: string | boolean | undefined = e.detail?.value as (string | boolean | undefined);
    if (!format) return;

    this._applySelectedFormat(format, value);
  }

  private _callFormat(key: string, value?: string | boolean | undefined) {
    const handler = (this._toolbarModule.handlers?.[key] as ((value?: any) => void) | undefined);
    if (value === undefined) {
      if (key === 'header' || key === 'color') {
        value = false; // False for text normal or default color
      }
      if (key === 'link') {
        value = true; // True for creating a link
      }
    }
    if (typeof handler === 'function') {
      handler.call(this._toolbarModule, value);
      return;
    }
    if (key === 'clean') {
      const range = this._quill.getSelection();
      if (range) {
        this._quill.removeFormat(range.index, range.length || 0);
      } else {
        this._quill.removeFormat(0, this._quill.getLength());
      }
      return;
    }
    const range = this._quill.getSelection();
    const formats: Record<string, unknown> = range ? this._quill.getFormat(range) : {};
    const current = formats[key];
    const next: boolean | string | number = value !== undefined ? value as boolean | string | number : !(current as boolean);
    this._quill.format(key, next);
  }

  private _applySelectedFormat(key: string, value?: string | boolean) {
    try {
      const sel = this._quill.getSelection();
      if (sel && this._startIndex >= 0) {
        const insertIndex = this._startIndex;
        const length = sel.index - insertIndex;
        if (length >= 0) {
          this._quill.deleteText(insertIndex, length, 'user');
          this._quill.setSelection(insertIndex, 0, 'silent');
        }
      }
    } catch {
      // no-op
    }

    if (key === 'insert' && typeof value === 'string') {
      const sel = this._quill.getSelection();
      if (sel) {
        this._quill.insertText(sel.index, value, 'user');
        this._quill.setSelection(sel.index + value.length, 0, 'silent');
      }
      this._quill.focus();
      this.hide();
      return;
    }

    this._callFormat(key, value);
    this._quill.focus();
    this.hide();
  }

  private _getOptions(): ResultItem[] {
    const options = [];

    if (this._commands.length > 0) {
      options.push(...this._commands.map(cmd => ({
        icon: 'quickreply',
        label: cmd.title,
        value: cmd.content,
        format: 'insert'
      } satisfies ResultItem)));
    }

    options.push(
      {icon: 'quickreply', label: 'Canned Responses', module: 'dialog'},
      {icon: 'format_bold', label: 'Bold', format: 'bold'},
      {icon: 'format_italic', label: 'Italic', format: 'italic'},
      {icon: 'format_underlined', label: 'Underline', format: 'underline'},
      {icon: 'strikethrough_s', label: 'Strikethrough', format: 'strike'},
      {icon: 'format_quote', label: 'Blockquote', format: 'blockquote'},
      {icon: 'code', label: 'Inline Code', format: 'code'},
      {icon: 'code_blocks', label: 'Code Block', format: 'code-block'},
      {icon: 'format_h1', label: 'Heading 1', format: 'header', value: '1'},
      {icon: 'format_h2', label: 'Heading 2', format: 'header', value: '2'},
      {icon: 'match_case', label: 'Normal Text', format: 'header', value: ''},
      {icon: 'format_list_bulleted', label: 'Bulleted List', format: 'list', value: 'bullet'},
      {icon: 'format_list_numbered', label: 'Numbered List', format: 'list', value: 'ordered'},
      {icon: 'checklist', label: 'Checklist', format: 'list', value: 'checked'},
      {icon: 'link', label: 'Link', format: 'link', value: true},
      {icon: 'horizontal_rule', label: 'Divider', format: 'divider'},
      {icon: 'attachment', label: 'Attachment', format: 'attachment'},
      {icon: 'image', label: 'Image', format: 'image'},
      {icon: 'video_camera_back', label: 'Video', format: 'video'},
      {icon: 'calendar_today', label: 'Date', format: 'date'},
      {icon: 'format_clear', label: 'Clear Formatting', format: 'clean'}
    );

    return options;
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

export default ContextMenu;
