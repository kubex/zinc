import './context-menu-component';
import {html} from "lit";
import {litToHTML} from "../../../../utilities/lit-to-html";
import {type ResultItem} from "./context-menu-component";
import Quill, {Delta} from "quill";
import ZnEditorQuickAction from "./quick-action";
import type ContextMenuComponent from "./context-menu-component";
import type Toolbar from "../toolbar/toolbar";

class ContextMenu {
  private _quill: Quill;
  private readonly _toolbarModule: Toolbar;
  private _component: ContextMenuComponent;
  private _startIndex = -1;
  private _keydownHandler = (e: KeyboardEvent) => this.onKeydown(e);
  private _docClickHandler = (e: MouseEvent) => this.onDocumentClick(e);

  constructor(quill: Quill) {
    this._quill = quill;
    this._toolbarModule = quill.getModule('toolbar') as Toolbar;

    this.initComponent();
    this.attachEvents();
  }

  private initComponent() {
    this._component = this.createComponent()!;
    this._quill.container.ownerDocument.body.appendChild(this._component);
  }

  private attachEvents() {
    this._quill.on(Quill.events.TEXT_CHANGE, () => this.updateFromEditor());
    this._quill.on(Quill.events.EDITOR_CHANGE, () => this.updateFromEditor());
    this._quill.root.addEventListener('keydown', this._keydownHandler);
    this._component.addEventListener('zn-format-select', (e: Event) => this.onToolbarSelect(e as CustomEvent<ResultItem>));
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
    const left = Math.max(0, editorBounds.left + bounds.left);
    const top = editorBounds.top + bounds.bottom + 4;
    this._component.setPosition(left, top);
  }

  private getToolbarQuery(): { start: number; formatQuery: string } | null {
    try {
      const range = this._quill.getSelection();
      if (!range) return null;

      const cursor = range.index;
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
      if (item?.format === 'toolbar' && item?.key) {
        e.preventDefault();
        e.stopPropagation();
        this._clickToolbarItem(item.key);
        return;
      }
      if (item?.format) {
        e.preventDefault();
        e.stopPropagation();
        this._applySelectedFormat(item.format, item.value);
      }
    }
  }

  private onToolbarSelect(e: CustomEvent<ResultItem>) {
    const key: string | undefined = e.detail?.key as (string | undefined);
    if (key) {
      this._clickToolbarItem(key);
      return;
    }

    const format: string = e.detail?.format || '';
    const value: string | boolean | undefined = e.detail?.value as (string | boolean | undefined);
    if (!format) return;

    this._applySelectedFormat(format, value);
  }

  private _clickToolbarItem(key: string) {
    this.deleteLastIndex();
    this._toolbarModule.trigger?.(key);
    this.hide();
  }

  private _applySelectedFormat(key: string, value?: string | boolean) {
    this.deleteLastIndex();

    if (key === 'insert' && typeof value === 'string') {
      const range = this._quill.getSelection();
      if (range) {
        let insertIndex = range.index - 1;
        this._quill.deleteText(insertIndex, 1, 'user');

        const prevChar = this._quill.getText(insertIndex - 1, 1);
        if (prevChar !== ' ' && insertIndex > 0) {
          this._quill.insertText(insertIndex, ' ', 'user');
          insertIndex += 1;
        }

        const contentDelta = this._quill.clipboard.convert({html: value});
        this._quill.updateContents(
          new Delta().retain(insertIndex).concat(contentDelta),
          'user'
        );

        setTimeout(() => this._quill.setSelection(insertIndex + contentDelta.length(), 0, 'silent'), 0);
      }
      this._quill.focus();
      this.hide();
      return;
    }

    this._toolbarModule.callFormat(key, value);
    this._quill.focus();
    this.hide();
  }

  private deleteLastIndex() {
    const sel = this._quill.getSelection();
    if (sel && this._startIndex >= 0) {
      const insertIndex = this._startIndex;
      const length = sel.index - insertIndex;
      if (length >= 0) {
        this._quill.deleteText(insertIndex, length, 'user');
        this._quill.setSelection(insertIndex, 0, 'silent');
      }
    }
  }

  private _getOptions(): ResultItem[] {
    const options: ResultItem[] = [];

    // 1) Quick Actions
    const root = this._quill.container.getRootNode() as ShadowRoot;
    if (root?.host) {
      const slot = root.querySelector('slot[name="context-items"]') as HTMLSlotElement | null;
      const assigned = slot ? slot.assignedElements({flatten: true}) : [];
      assigned.forEach((quickAction: Element) => {
        if (!(quickAction instanceof ZnEditorQuickAction)) return;

        const {label, content, uri, icon, key} = quickAction;

        if (label && icon) {
          if (key) {
            options.push({icon, label, format: 'toolbar', key: key});
          } else if (uri) {
            options.push({icon, label, format: 'dialog', value: uri});
          } else if (content) {
            options.push({icon, label, format: 'insert', value: content});
          }
        }
      });
    }

    // 2) Built-in Actions
    options.push(
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
