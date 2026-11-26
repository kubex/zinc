import {filterSlashItems, SLASH_ITEM_SELECT} from "../../../slash-menu";
import {flattenTools} from "../toolbar/tools";
import {onEditorChange} from '../host';
import ZnEditorQuickAction from "./quick-action";
import type {EditorHost} from '../host';
import type {SlashMenuItem} from "../../../slash-menu";
import type {VirtualElement} from "@floating-ui/dom";
import type RichEditor from '../../../../internal/rich-text/rich-editor';
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
  private _editor: RichEditor;
  private readonly _container: HTMLElement;
  private readonly _toolbarModule: Toolbar;
  private _menu: ZnSlashMenu;
  private _startIndex = -1;
  /** Trigger position the user dismissed with Escape; the menu stays shut until they move off it. */
  private _dismissedIndex = -1;
  private _keydownHandler = (e: KeyboardEvent) => this.onKeydown(e);
  private _docClickHandler = (e: MouseEvent) => this.onDocumentClick(e);
  private _pointerHeld = false;
  private _pointerReleaseHandler = () => {
    this._pointerHeld = false;
  };
  private readonly _caretAnchor: VirtualElement = {
    getBoundingClientRect: () => this.caretRect()
  };

  constructor(host: EditorHost) {
    this._editor = host.editor;
    this._container = host.container;
    this._toolbarModule = host.getModule<Toolbar>('toolbar')!;

    this.initComponent();
    this.attachEvents();
  }

  private initComponent() {
    const doc = this._container.ownerDocument;
    // The named import above pulls in the slash-menu module, which registers the element
    this._menu = doc.createElement('zn-slash-menu');
    this._menu.heading = 'Options';
    this._caretAnchor.contextElement = this._editor.root;
    this._menu.anchor = this._caretAnchor;
    doc.body.appendChild(this._menu);
  }

  private attachEvents() {
    onEditorChange(this._editor, () => this.updateFromEditor());
    this._editor.root.addEventListener('keydown', this._keydownHandler);
    this._menu.addEventListener(SLASH_ITEM_SELECT, (e: Event) => this.onItemSelect(e as CustomEvent<{ item: ContextMenuItem }>));
    this._menu.addEventListener('pointerdown', () => {
      this._pointerHeld = true;
      this._container.ownerDocument.addEventListener('pointerup', this._pointerReleaseHandler, {once: true, capture: true});
    });
  }

  private onDocumentClick(e: MouseEvent) {
    const path = e.composedPath();
    if (!path.includes(this._menu) && !path.includes(this._editor.root)) {
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
    const index = this._startIndex >= 0 ? this._startIndex : (this._editor.getSelection()?.index ?? 0);
    const bounds = this._editor.getBounds(index);
    return new DOMRect(bounds.left, bounds.top, 0, bounds.height);
  }

  private getToolbarQuery(): { start: number; formatQuery: string } | null {
    try {
      const range = this._editor.getSelection();
      if (!range) return null;

      const cursor = range.index;
      const characterLimit = 50;
      const textBefore = this._editor.getText(Math.max(0, cursor - characterLimit), Math.min(characterLimit, cursor));
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
    this._afterPointerRelease(() => this._toolbarModule.trigger?.(key));
    this.hide();
  }

  /** Items select on mousedown; a modal opened mid-press is light-dismissed by the pointerup landing on its backdrop. */
  private _afterPointerRelease(action: () => void) {
    if (!this._pointerHeld) {
      action();
      return;
    }

    this._container.ownerDocument.addEventListener('pointerup', () => {
      setTimeout(action);
    }, {once: true, capture: true});
  }

  private _applySelectedFormat(key: string, value?: string | boolean) {
    this.deleteLastIndex();

    if (key === 'insert' && typeof value === 'string') {
      const range = this._editor.getSelection();
      if (range) {
        let insertIndex = range.index;

        const prevChar = this._editor.getText(insertIndex - 1, 1);
        if (insertIndex > 0 && !/\s/.test(prevChar)) {
          this._editor.insertText(insertIndex, ' ');
          insertIndex += 1;
        }

        const end = this._editor.insertHTML(insertIndex, value);
        setTimeout(() => this._editor.setSelection(end, 0), 0);
      }
      this._editor.focus();
      this.hide();
      return;
    }

    if (key === 'dialog') {
      this._afterPointerRelease(() => this._toolbarModule.callFormat(key, value));
      this.hide();
      return;
    }

    this._toolbarModule.callFormat(key, value);
    this._editor.focus();
    this.hide();
  }

  private deleteLastIndex() {
    const sel = this._editor.getSelection();
    if (sel && this._startIndex >= 0) {
      const insertIndex = this._startIndex;
      const length = sel.index - insertIndex;
      if (length >= 0) {
        this._editor.deleteText(insertIndex, length);
        this._editor.setSelection(insertIndex, 0);
      }
    }
  }

  private _getOptions(): ContextMenuItem[] {
    const options: ContextMenuItem[] = [];
    let orderCounter = 0;

    // 1) Quick Actions
    const root = this._container.getRootNode() as ShadowRoot;
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
    }

    // 2) Toolbar tools offered here: custom ones first, by key, so a dialog waits for the click to finish
    const tools = flattenTools(this._toolbarModule.tools).filter(tool => tool.slash);
    [...tools.filter(tool => tool.group === 'custom'), ...tools.filter(tool => tool.group !== 'custom')].forEach(tool => {
      const order = orderCounter++;
      if (tool.group === 'custom') {
        options.push({icon: tool.icon, label: tool.label, key: tool.id, order});
      } else {
        options.push({icon: tool.icon, label: tool.label, format: tool.format, formatValue: tool.value, keywords: tool.keywords, order});
      }
    });

    return options;
  }

  private show() {
    if (this._menu.open) return;

    this._menu.show();
    this._container.ownerDocument.addEventListener('click', this._docClickHandler);
  }

  private hide() {
    this._startIndex = -1;
    if (!this._menu.open) return;

    this._menu.hide();
    this._container.ownerDocument.removeEventListener('click', this._docClickHandler);
  }

  public isOpen() {
    return this._menu?.open ?? false;
  }
}

export default ContextMenu;
