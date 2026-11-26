import './toolbar.component';
import {flattenTools} from "./tools";
import {onEditorChange} from '../host';
import type {EditorFeatureConfig} from "../../editor.component";
import type {EditorHost, PickerModule} from '../host';
import type {ToolDef} from "./tools";
import type Attachment from "../attachment/attachment";
import type Dialog from "../dialog/dialog";
import type RichEditor from '../../../../internal/rich-text/rich-editor';
import type ToolbarComponent from "./toolbar.component";

type Handler = (value?: string | boolean, anchor?: Element) => void;

/**
 * Runs the editor's tools: renders them through every attached toolbar, keeps those toolbars told of the current
 * formats, and applies a tool when one of its controls is clicked.
 */
class Toolbar {
  private readonly _host: EditorHost;
  private readonly _editor: RichEditor;
  private readonly _components = new Set<ToolbarComponent>();
  private _tools: ToolDef[] = [];
  readonly handlers: Record<string, Handler> = {};

  constructor(host: EditorHost, options: {config?: EditorFeatureConfig}) {
    const editor = host.editor;
    const config = options.config ?? {};
    this._host = host;
    this._editor = editor;

    if (config.attachmentsEnabled) this.addHandler('attachment', () => null);
    if (config.datesEnabled) this.addHandler('date', (_, anchor) => this._openPicker('datePicker', anchor));
    if (config.emojisEnabled) this.addHandler('emoji', (_, anchor) => this._openPicker('emoji', anchor));
    if (config.dividersEnabled) this.addHandler('divider', () => this._insertDivider());
    if (config.imagesEnabled) this.addHandler('image', () => this._addImage());
    if (config.linksEnabled) this.addHandler('unlink', () => this._unlink());
    this.addHandler('redo', () => {
      editor.redo();
      editor.focus();
    });
    this.addHandler('undo', () => {
      editor.undo();
      editor.focus();
    });
    this.addHandler('dialog', value => this._openDialog(String(value)));

    onEditorChange(editor, this._sync);
    editor.root.addEventListener('click', this._sync);
  }

  get tools(): ToolDef[] {
    return this._tools;
  }

  setTools(tools: ToolDef[]) {
    this._tools = tools;
    this._components.forEach(component => (component.tools = tools));
  }

  /** Renders the tools through a toolbar and routes its clicks here. */
  attach(component: ToolbarComponent) {
    // A layout change replaces the toolbars, so let go of the ones no longer shown
    this._components.forEach(c => c.isConnected || this._components.delete(c));
    if (this._components.has(component)) return;
    this._components.add(component);
    component.tools = this._tools;
    component.formats = this._editor.getFormat();
    component.addEventListener('click', this._onClick);
  }

  public addHandler(format: string, handler: Handler) {
    this.handlers[format] = handler;
  }

  public callFormat(key: string, value?: string | boolean, anchor?: Element) {
    const handler = this.handlers[key];
    if (value === undefined) {
      if (key === 'header' || key === 'color') {
        value = false; // False for text normal or default color
      }
      if (key === 'link') {
        value = true; // True for creating a link
      }
    }
    if (typeof handler === 'function') {
      handler.call(this, value, anchor);
      return;
    }
    if (key === 'clean') {
      const range = this._editor.getSelection();
      if (range) {
        this._editor.removeFormat(range.index, range.length || 0);
      } else {
        this._editor.removeFormat(0, this._editor.getLength());
      }
      this._editor.focus();
      return;
    }
    const range = this._editor.getSelection();
    const formats: Record<string, unknown> = range ? this._editor.getFormat(range.index, range.length) : {};
    const current = formats[key];
    let next: boolean | string | number = value !== undefined ? value as boolean | string | number : !(current as boolean);
    if (key === 'list' && current === value) {
      next = false;
    }
    this._editor.format(key, next);
    // Back to the text, so typing carries on where it stopped rather than into the menu that was used
    this._editor.focus();
  }

  /** Applies the tool with this id, as the `/` menu and quick actions name them. */
  public trigger(id: string, anchor?: Element) {
    const tool = flattenTools(this._tools).find(t => t.id === id);
    if (tool?.format) this.callFormat(tool.format, tool.value, anchor);
  }

  private _onClick = (e: Event) => {
    for (const node of e.composedPath()) {
      if (node === e.currentTarget) return;
      if (node instanceof HTMLElement && node.hasAttribute('data-format')) {
        this.callFormat(node.getAttribute('data-format')!, node.getAttribute('data-format-type') ?? undefined, node);
        return;
      }
    }
  };

  private _sync = () => {
    const formats = this._editor.getFormat();
    this._components.forEach(component => (component.formats = formats));
  };

  private _openPicker(name: string, anchor?: Element) {
    const picker = this._host.getModule<PickerModule>(name);
    if (picker) this._host.openPicker(picker.element, anchor);
  }

  // With no selection, removes the whole link under the cursor
  private _unlink() {
    const range = this._editor.getSelection(true);
    if (!range) return;
    const target = range.length > 0 ? range : this._editor.getFormatExtent(range.index, 'link');
    if (target) this._editor.formatText(target.index, target.length, 'link', false);
  }

  private _insertDivider() {
    const selection = this._editor.getSelection(true)!;
    const index = selection.index + selection.length;
    this._editor.insertEmbed(index, 'hr');
    this._editor.setSelection(index + 1, 0);
  }

  private _openDialog(uri: string) {
    const dialog = this._host.getModule<Dialog>('dialog')?.component;
    if (!dialog) return;

    dialog.dialogEl.showModal();
    dialog.setContent(`<app-space id="app-editor-modal" fetch-style="app-space-inline" allow-scripts auto-load loading-text="Loading, please wait..." uri="${uri}"></app-space>`);
  }

  private _addImage() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = () => {
      const file = input.files?.[0];
      if (file) this.insertImage(file);
    };
  }

  /** Puts an image in the text at the caret, held inline as data, and uploads it as an attachment too. */
  public insertImage(file: File) {
    if (!file.type.startsWith('image/')) return;
    const reader = new window.FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const selection = this._editor.getSelection(true)!;
      const index = selection.index + selection.length;
      this._editor.insertEmbed(index, 'image', {src: dataUrl, alt: file.name.replace(/\.[^/.]+$/, ''), title: file.name});
      this._editor.setSelection(index + 1, 0);

      try {
        this._host.getModule<Attachment>('attachment')?.addAttachment(file, dataUrl);
      } catch (err) {
        console.warn('[Toolbar] Failed to process image with attachment handler', err);
      }
    };
    reader.readAsDataURL(file);
  }
}

export default Toolbar;
