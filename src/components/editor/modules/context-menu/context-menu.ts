import {filterSlashItems, SLASH_ITEM_SELECT} from "../../../slash-menu";
import Delta from "quill-delta";
import Quill from "quill";
import ZnEditorQuickAction from "./quick-action";
import ZnEditorTool from "../toolbar/tool";
import type {EditorFeatureConfig} from "../../editor.component";
import type {SlashMenuItem} from "../../../slash-menu";
import type {VirtualElement} from "@floating-ui/dom";
import type Toolbar from "../toolbar/toolbar";
import type ZnSlashMenu from "../../../slash-menu";

/**
 * A slash menu entry plus what choosing it does in the editor: trigger a toolbar tool by `key`,
 * or apply `format` with `formatValue`. `SlashMenuItem.value` is left unset so the menu never
 * renders format values as insertion tokens.
 */
interface ContextMenuItem extends SlashMenuItem {
  format?: string;
  key?: string;
  formatValue?: string | boolean;
}

class ContextMenu {
  private _quill: Quill;
  private readonly _toolbarModule: Toolbar;
  private _menu: ZnSlashMenu;
  private _startIndex = -1;
  /** Trigger position the user dismissed with Escape; the menu stays shut until they move off it. */
  private _dismissedIndex = -1;
  private _keydownHandler = (e: KeyboardEvent) => this.onKeydown(e);
  private _docClickHandler = (e: MouseEvent) => this.onDocumentClick(e);
  private _featureConfig: EditorFeatureConfig = {};
  private readonly _caretAnchor: VirtualElement = {
    getBoundingClientRect: () => this.caretRect()
  };

  constructor(quill: Quill, options: { config: EditorFeatureConfig }) {
    this._quill = quill;
    this._toolbarModule = quill.getModule('toolbar') as Toolbar;
    this._featureConfig = options.config || {};

    this.initComponent();
    this.attachEvents();
  }

  private initComponent() {
    const doc = this._quill.container.ownerDocument;
    // The named import above pulls in the slash-menu module, which registers the element
    this._menu = doc.createElement('zn-slash-menu');
    this._menu.heading = 'Options';
    this._caretAnchor.contextElement = this._quill.root;
    this._menu.anchor = this._caretAnchor;
    doc.body.appendChild(this._menu);
  }

  private attachEvents() {
    this._quill.on(Quill.events.EDITOR_CHANGE, () => this.updateFromEditor());
    this._quill.root.addEventListener('keydown', this._keydownHandler);
    this._menu.addEventListener(SLASH_ITEM_SELECT, (e: Event) => this.onItemSelect(e as CustomEvent<{ item: ContextMenuItem }>));
    this._quill.focus();
  }

  private onDocumentClick(e: MouseEvent) {
    const path = e.composedPath();
    if (!path.includes(this._menu) && !path.includes(this._quill.root)) {
      this.hide();
    }
  }

  private updateFromEditor() {
    const info = this.getToolbarQuery();
    if (!info || info.start === this._dismissedIndex) {
      this.hide();
      return;
    }

    const {start, formatQuery} = info;
    const matches = filterSlashItems(this._getOptions(), formatQuery);
    if (!matches.length) {
      this.hide();
      return;
    }

    this._startIndex = start;
    this._menu.query = formatQuery;
    this._menu.items = matches;
    this.show();
  }

  private caretRect(): DOMRect {
    const index = this._startIndex >= 0 ? this._startIndex : (this._quill.getSelection()?.index ?? 0);
    const container = this._quill.container.getBoundingClientRect();
    const bounds = this._quill.getBounds(index);
    if (!bounds) return new DOMRect(container.left, container.top, 0, 0);

    return new DOMRect(container.left + bounds.left, container.top + bounds.top, 0, bounds.height);
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
    if (!this._menu.open) return;

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        this._dismissedIndex = this._startIndex;
        this.hide();
        return;

      case 'ArrowDown':
        e.preventDefault();
        e.stopPropagation();
        this._menu.moveActive(1);
        return;

      case 'ArrowUp':
        e.preventDefault();
        e.stopPropagation();
        this._menu.moveActive(-1);
        return;

      case 'Enter': {
        if (!this._menu.activeItem) return;

        e.preventDefault();
        e.stopPropagation();
        this._menu.selectActive();
      }
    }
  }

  private onItemSelect(e: CustomEvent<{ item: ContextMenuItem }>) {
    const item = e.detail?.item;
    if (!item) return;

    if (item.key) {
      this._clickToolbarItem(item.key);
      return;
    }

    if (item.format) {
      this._applySelectedFormat(item.format, item.formatValue);
    }
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
        this._quill.deleteText(insertIndex, 1, Quill.sources.USER);

        const prevChar = this._quill.getText(insertIndex - 1, 1);
        if (prevChar !== ' ' && insertIndex > 0) {
          this._quill.insertText(insertIndex, ' ', Quill.sources.USER);
          insertIndex += 1;
        }

        const contentDelta = this._quill.clipboard.convert({html: value});
        this._quill.updateContents(
          new Delta().retain(insertIndex).concat(contentDelta),
          Quill.sources.USER
        );

        setTimeout(() => this._quill.setSelection(insertIndex + contentDelta.length() + 1, 0, Quill.sources.SILENT), 0);
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
        this._quill.deleteText(insertIndex, length, Quill.sources.USER);
        this._quill.setSelection(insertIndex, 0, Quill.sources.SILENT);
      }
    }
  }

  private _getOptions(): ContextMenuItem[] {
    const options: ContextMenuItem[] = [];
    let orderCounter = 0;

    // 1) Quick Actions
    const root = this._quill.container.getRootNode() as ShadowRoot;
    if (root?.host) {
      const slot = root.querySelector('slot[name="context-items"]') as HTMLSlotElement | null;
      const assigned = slot ? slot.assignedElements({flatten: true}) : [];
      assigned.forEach((quickAction: Element) => {
        if (!(quickAction instanceof ZnEditorQuickAction)) return;

        const {label, content, uri, icon, key} = quickAction;

        let order: number;
        if (typeof quickAction.order === 'number') {
          order = quickAction.order!;
        } else {
          order = orderCounter++;
        }

        if (label && icon) {
          if (key) {
            options.push({icon, label, key: key, order});
          } else if (uri) {
            options.push({icon, label, format: 'dialog', formatValue: uri, order});
          } else if (content) {
            options.push({icon, label, format: 'insert', formatValue: content, order});
          }
        }
      });

      const toolSlot = root.querySelector('slot[name="tools"]') as HTMLSlotElement | null;
      const tools = toolSlot ? toolSlot.assignedElements({flatten: true}) : [];
      tools.forEach((tool: Element) => {
        if (!(tool instanceof ZnEditorTool) || !tool.contextMenu) return;

        const {label, icon, key} = tool;
        if (!label || !icon || !key) return;

        const order = typeof tool.order === 'number' ? tool.order : orderCounter++;
        options.push({icon, label, key: key, order});
      });
    }

    // 2) Built-in Actions (In order they should appear)
    options.push(
      {icon: 'bold@lu', label: 'Bold', format: 'bold', keywords: 'bold', order: orderCounter++},
      {icon: 'italic@lu', label: 'Italic', format: 'italic', keywords: 'italic', order: orderCounter++},
      {icon: 'underline@lu', label: 'Underline', format: 'underline', keywords: 'underline', order: orderCounter++},
      {icon: 'strikethrough@lu', label: 'Strikethrough', format: 'strike', keywords: 'strike', order: orderCounter++},
      {icon: 'text-quote@lu', label: 'Blockquote', format: 'blockquote', keywords: 'blockquote', order: orderCounter++},
    );
    if (this._featureConfig.codeEnabled !== false) {
      options.push({icon: 'code@lu', label: 'Inline Code', format: 'code', keywords: 'code', order: orderCounter++});
    }
    if (this._featureConfig.codeBlocksEnabled !== false) {
      options.push({icon: 'square-code@lu', label: 'Code Block', format: 'code-block', keywords: 'code-block', order: orderCounter++});
    }
    options.push(
      {icon: 'heading-1@lu', label: 'Heading 1', format: 'header', formatValue: '1', keywords: 'header,h1', order: orderCounter++},
      {icon: 'heading-2@lu', label: 'Heading 2', format: 'header', formatValue: '2', keywords: 'header,h2', order: orderCounter++},
      {icon: 'case-sensitive@lu', label: 'Normal Text', format: 'header', formatValue: '', keywords: 'header,paragraph', order: orderCounter++},
      {icon: 'list@lu', label: 'Bulleted List', format: 'list', formatValue: 'bullet', keywords: 'list,bullet', order: orderCounter++},
      {icon: 'list-ordered@lu', label: 'Numbered List', format: 'list', formatValue: 'ordered', keywords: 'list,ordered', order: orderCounter++},
      {icon: 'list-todo@lu', label: 'Checklist', format: 'list', formatValue: 'checked', keywords: 'list,checked,todo', order: orderCounter++}
    );
    if (this._featureConfig.linksEnabled !== false) {
      options.push({icon: 'link@lu', label: 'Link', format: 'link', formatValue: true, keywords: 'link', order: orderCounter++});
    }
    if (this._featureConfig.dividersEnabled !== false) {
      options.push({icon: 'minus@lu', label: 'Divider', format: 'divider', keywords: 'divider,hr', order: orderCounter++});
    }
    if (this._featureConfig.attachmentsEnabled !== false) {
      options.push({icon: 'paperclip@lu', label: 'Attachment', format: 'attachment', keywords: 'attachment', order: orderCounter++});
    }
    if (this._featureConfig.imagesEnabled !== false) {
      options.push({icon: 'image@lu', label: 'Image', format: 'image', keywords: 'image', order: orderCounter++});
    }
    if (this._featureConfig.videosEnabled !== false) {
      options.push({icon: 'video@lu', label: 'Video', format: 'video', keywords: 'video', order: orderCounter++});
    }
    if (this._featureConfig.datesEnabled !== false) {
      options.push({icon: 'calendar@lu', label: 'Date', format: 'date', keywords: 'date', order: orderCounter++});
    }
    options.push({icon: 'remove-formatting@lu', label: 'Clear Formatting', format: 'clean', keywords: 'clean', order: orderCounter++});

    return options;
  }

  private show() {
    if (this._menu.open) return;

    this._menu.show();
    this._quill.container.ownerDocument.addEventListener('click', this._docClickHandler);
  }

  private hide() {
    this._startIndex = -1;
    if (!this._menu.open) return;

    this._menu.hide();
    this._quill.container.ownerDocument.removeEventListener('click', this._docClickHandler);
  }

  public isOpen() {
    return this._menu?.open ?? false;
  }
}

export default ContextMenu;
