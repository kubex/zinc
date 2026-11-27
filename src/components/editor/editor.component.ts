import {
  alignment,
  blockquote,
  codeBlock,
  color,
  heading,
  hr,
  image,
  link,
  lists,
  marks,
  mergeFields,
  normaliseToken,
  textStyle,
  video,
} from '../../internal/rich-text/extensions';
import {type CSSResultGroup, html, nothing, type PropertyValues, render as renderInto, unsafeCSS} from 'lit';
import {deepQuerySelectorAll, idSelector} from "../../utilities/query";
import {FormControlController} from '../../internal/form';
import {HasSlotController} from "../../internal/slot";
import {on} from "../../utilities/on";
import {property, query, state} from 'lit/decorators.js';
import {Store} from "../../internal/storage";
import {toolsFor} from './modules/toolbar/tools';
import Attachment, {putFile} from "./modules/attachment/attachment";
import ContextMenu from "./modules/context-menu/context-menu";
import DatePicker from "./modules/date-picker/date-picker";
import Dialog from "./modules/dialog/dialog";
import EditorAI from "./modules/ai";
import Emoji from "./modules/emoji/emoji";
import HeadlessEmoji from "./modules/emoji/headless/headless-emoji";
import RichEditor from '../../internal/rich-text/rich-editor';
import TimeTracking from "./modules/time-tracking/time-tracking";
import Toolbar from "./modules/toolbar/toolbar";
import ZincElement from '../../internal/zinc-element';
import ZnInput from '../input';
import ZnTextarea from "../textarea";
import type {EditorHost} from './modules/host';
import type {Extension} from '../../internal/rich-text/extension';
import type {OnEvent} from "../../utilities/on";
import type {TextRange} from '../../internal/rich-text/rich-editor';
import type {Uploader} from './modules/attachment/attachment';
import type {ZincFormControl} from '../../internal/zinc-element';
import type {ZnEditorInsertEvent} from "./modules/events/zn-editor-insert";
import type ToolbarComponent from "./modules/toolbar/toolbar.component";
import type ZnEditorQuickAction from "./modules/context-menu/quick-action";
import type ZnEditorTool from './modules/toolbar/tool';
import type ZnPopup from '../popup';

import airDatepickerStyles from '../../../scss/air-datapicker.scss';
import formControlStyles from '../../form-control.scss';
import styles from './editor.scss';

export interface EditorFeatureConfig {
  codeBlocksEnabled?: boolean;
  dividersEnabled?: boolean;
  linksEnabled?: boolean;
  attachmentsEnabled?: boolean;
  imagesEnabled?: boolean;
  videosEnabled?: boolean;
  datesEnabled?: boolean;
  emojisEnabled?: boolean;
  codeEnabled?: boolean;
  aiEnabled?: boolean;
}

type PromptKind = 'link' | 'video';

// Editing aid only: added to the document mode frame and left out of the saved HTML
const DOCUMENT_OUTLINES_ID = 'zn-editor-outlines';

/**
 * @summary A rich text editor with a toolbar, slash menu, emoji, date and AI tools, and form support.
 * @documentation https://zinc.style/components/editor
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-input
 *
 * @event zn-change - Emitted after every change to the content.
 * @event zn-submit - Emitted when Enter sends a chat message.
 * @event zn-element-added - Emitted once the editing area is ready.
 *
 * @slot tools - Extra `zn-editor-tool` buttons for the toolbar.
 * @slot context-items - `zn-editor-quick-action` entries for the slash menu.
 * @slot actions - Content such as a send button: under the editor, or at the end of the footer bar in the quiet and
 * composer layouts.
 * @slot help-text - Text under the editor. Alternatively, use the `help-text` attribute.
 *
 * @csspart content - The editable area.
 *
 * @cssproperty --editor-min-height - The composer layout's smallest text height.
 * @cssproperty --editor-max-height - The composer layout's text height before it scrolls.
 */
export default class ZnEditor extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = [unsafeCSS(formControlStyles), unsafeCSS(airDatepickerStyles), unsafeCSS(styles)];
  static dependencies = {'zn-input': ZnInput};

  private formControlController = new FormControlController(this, {});
  private readonly hasSlotController = new HasSlotController(this, 'help-text');

  // The text lives in one box for the editor's life; a layout change moves it, where drawing a new one would leave
  // the editing attached to the old
  private readonly _box = Object.assign(document.createElement('div'), {className: 'editor__box'});

  @query('#editor')
  private editor: HTMLElement;

  @query('.editor__content')
  private content: HTMLElement;

  @query('#editorHtml')
  private editorHtml: HTMLTextAreaElement;


  @query('.editor__picker')
  private picker: ZnPopup;

  @query('.editor__bubble')
  private bubble: ZnPopup | null;

  @query('.editor__prompt-url')
  private promptInput: ZnInput;

  @query('.editor__prompt-text')
  private promptText: ZnInput | null;

  @property({reflect: true}) id: string;
  @property() name: string;
  @property() value: string;

  @property() placeholder = 'Compose your reply...';

  /** The older name for `layout="field"`, kept in step with it. */
  @property({type: Boolean, reflect: true}) compact = false;

  /**
   * How the tools are laid out: `toolbar` above the text; `quiet`, with formatting in a bar that appears over
   * selected text and inserts in a slim footer; `composer`, a chat-style card with the tools along its bottom
   * edge and formatting behind a Formatting toggle; or `field`, a bordered, resizable box under a small toolbar,
   * drawn as a form field.
   */
  @property({reflect: true}) layout: 'toolbar' | 'quiet' | 'composer' | 'field' = 'toolbar';

  /** Adds a Source button that switches to editing the raw HTML, which is submitted as written. */
  @property({attribute: 'source', type: Boolean}) sourceEnabled = false;

  /** Edits the HTML in place as a whole document, keeping layout the editor can't hold, such as a designed email. */
  @property({attribute: 'document-mode', type: Boolean, reflect: true}) documentMode = false;

  @query('.editor__document') private documentFrame: HTMLIFrameElement;

  /** Shows only the content, without a toolbar or box, such as the source beside a translation. */
  @property({type: Boolean, reflect: true}) readonly = false;

  /** In the `field` layout, a short label inside the box ahead of the content, such as a language code. */
  @property() prefix = '';

  @state() private _sourceMode = false;
  @state() private _prompt: PromptKind | null = null;
  @state() private _promptPosition = {top: 0, left: 0};
  @state() private _promptHasLink = false;
  @state() private _formatOpen = false;

  /** Text under the editor that describes how to use it. If you need to display HTML, use the `help-text` slot instead. */
  @property({attribute: 'help-text'}) helpText = '';

  @property({attribute: 'interaction-type', type: String})
  interactionType: 'ticket' | 'chat' = 'chat';

  @property({attribute: 'attachment-url', type: String})
  uploadAttachmentUrl: string;

  /* Feature Permission Attributes */
  @property({attribute: 'code-blocks', type: Boolean}) codeBlocksEnabled: boolean = false;
  @property({attribute: 'dividers', type: Boolean}) dividersEnabled: boolean = false;
  @property({attribute: 'links', type: Boolean}) linksEnabled: boolean = false;
  @property({attribute: 'attachments', type: Boolean}) attachmentsEnabled: boolean = false;
  /** Shows each attachment as a slim one-line chip, for an application with little room under the text. */
  @property({attribute: 'condensed-attachments', type: Boolean, reflect: true}) condensedAttachments = false;
  /** From this many attachments they fold into one stack that opens their list. `0` never stacks. */
  @property({attribute: 'stack-attachments', type: Number}) stackAttachments = 4;
  @property({attribute: 'images', type: Boolean}) imagesEnabled: boolean = false;
  @property({attribute: 'videos', type: Boolean}) videosEnabled: boolean = false;
  @property({attribute: 'dates', type: Boolean}) datesEnabled: boolean = false;
  @property({attribute: 'emojis', type: Boolean}) emojisEnabled: boolean = false;
  @property({attribute: 'code', type: Boolean}) codeEnabled: boolean = false;
  @property({attribute: 'ai', type: Boolean}) aiEnabled: boolean = false;

  /**
   * Shows `{{token}}` replacements as highlighted chips, labelled from the matching `context-items`
   * quick action. The value still holds the raw tokens.
   */
  @property({attribute: 'merge-fields', type: Boolean}) mergeFieldsEnabled: boolean = false;
  @property({attribute: 'ai-path'}) aiPath: string = '';

  /**
   * Caches unsent content while typing and restores it when the editor next loads,
   * so agent replies in tickets/chats survive reloads and navigation. Use a key
   * unique to the conversation (e.g. the ticket ID). The cache is cleared on submit.
   */
  @property({attribute: 'store-key', reflect: true}) storeKey: string = "";

  /** Cached-content expiry in seconds. Defaults to 1 day. */
  @property({attribute: 'store-ttl', type: Number, reflect: true}) storeTtl = 86400;

  /** Cache to localStorage instead of sessionStorage, persisting across tabs and browser restarts. */
  @property({attribute: 'local-storage', type: Boolean, reflect: true}) localStorage: boolean;

  /**
   * Uploads attachments in place of `attachment-url`: called with each file, it reports progress, stops when its
   * signal aborts, and resolves with the stored `path` (submitted in the `attachments` field) and a `url` to open it.
   */
  uploader?: Uploader;

  protected _store: Store;

  private _editor: RichEditor;
  private readonly _modules = new Map<string, unknown>();
  private _content: string = '';
  private _selectionRange: TextRange = {index: 0, length: 0};
  private _promptRange: TextRange | null = null;
  private _promptOriginalText = '';
  // in-flight attachment uploads; the leave-page prompt stays while any is running
  private _pendingUploads = 0;

  /**
   * The editing commands: read and change the content and selection by character index, e.g.
   * `insertText(index, text)`, `formatText(index, length, 'bold', true)`, `getSelection()`, `getHTML()`.
   */
  get commands(): RichEditor {
    return this._editor;
  }

  /** Adds a file to the attachments, uploading it as if it had been picked. Needs `attachments`. */
  attachFile(file: File) {
    this._module<Attachment>('attachment')?.addAttachment(file);
  }

  get validity(): ValidityState {
    return this.editorHtml.validity;
  }

  get validationMessage(): string {
    return this.editorHtml.validationMessage;
  }

  checkValidity(): boolean {
    return this.editorHtml.checkValidity();
  }

  getForm(): HTMLFormElement | null {
    return this.formControlController.getForm();
  }

  reportValidity(): boolean {
    return this.editorHtml.reportValidity();
  }

  setCustomValidity(message: string): void {
    this.editorHtml.setCustomValidity(message);
    this.formControlController.updateValidity();
  }

  connectedCallback() {
    super.connectedCallback();
    this._store = new Store(this.localStorage ? window.localStorage : window.sessionStorage, "zned:", this.storeTtl);
    document.addEventListener('zn-editor-update', this._handleTextChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('zn-editor-update', this._handleTextChange);
    this._closePicker();
    this._module<Attachment>('attachment')?.fold();
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    this.formControlController.updateValidity();

    const checkId = this.id || 'abc';
    on(document, 'click', `[editor-id="` + checkId + `"]`, (e: OnEvent) => {
      this._handleEditorChange(e);
    });

    this._editor = new RichEditor(this.content, {
      extensions: this._extensions(),
      placeholder: this.placeholder,
      readonly: this.readonly,
    });
    this._createModules();

    this._editor.addEventListener('change', this._handleTextChange);
    this._editor.addEventListener('selection-change', e => {
      const range = (e as CustomEvent<{range: TextRange | null}>).detail.range;
      if (range) this._selectionRange = range;
    });
    this._editor.addEventListener('link-request', () => this._openPrompt('link'));
    this._editor.addEventListener('files', this._handleFiles);
    this._editor.addEventListener('selection-change', () => this._updateBubble());
    this._editor.addEventListener('change', () => this._updateBubble());
    this.content.addEventListener('click', this._handleContentClick);
    this.content.addEventListener('dragover', this._handleImageDragOver);
    this.content.addEventListener('dragleave', this._handleImageDragLeave);
    this.content.addEventListener('drop', () => (this._dragSelection = undefined), {capture: true});
    // Ahead of the editor's own Enter handling, so a chat can send instead of adding a line
    this.content.addEventListener('keydown', this._handleEnter, {capture: true});
    this.content.addEventListener('keydown', this._handleBubbleShortcut);

    this.getForm()?.addEventListener('submit', () => {
      this._clearCachedContent();
      setTimeout(() => this._module<Attachment>('attachment')?.reset(), 0);
    });

    if (this.storeKey && this._isEmpty(this.value ?? '')) {
      const cached = this._store.get(this.storeKey);
      if (cached) {
        this.value = cached;
        this.editorHtml.value = cached;
      }
    }

    this._editor.setHTML(this.value ?? '');

    if (this.documentMode) {
      this._loadDocument(this.value ?? '');
    }

    // The editor gets focus only when asked: loading one into a page must not pull focus from where someone is working
    if (this.autofocus) {
      this._editor.setSelection(this._editor.getLength());
    }

    this.emit('zn-element-added', {detail: {element: this.editor}});
    super.firstUpdated(_changedProperties);
  }

  protected willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    // `compact` and `layout="field"` are one setting; a layout named alongside `compact` wins
    if (!this.hasUpdated) {
      if (this.compact && this.layout === 'toolbar') this.layout = 'field';
      else this.compact = this.layout === 'field';
    } else if (changed.has('layout')) {
      this.compact = this.layout === 'field';
    } else if (changed.has('compact')) {
      if (this.compact) this.layout = 'field';
      else if (this.layout === 'field') this.layout = 'toolbar';
    }
  }

  protected updated(changed: PropertyValues<this>) {
    super.updated(changed);
    if (!this._editor) return;
    // A layout change renders new toolbars
    const toolbar = this._module<Toolbar>('toolbar');
    if (toolbar) this._attachToolbars(toolbar);
    if (changed.has('readonly')) this._editor.setReadonly(this.readonly);
    if (changed.has('stackAttachments')) this._module<Attachment>('attachment')?.layout();
    if (changed.has('placeholder')) this._editor.setPlaceholder(this.placeholder);
    // A value set from outside replaces the content; one the editor produced is already shown
    if (changed.has('value') && !this._sourceMode && !this.documentMode && (this.value ?? '') !== this._editor.getHTML()) {
      this._editor.setHTML(this.value ?? '');
    }
  }

  // Every format is read whatever the toolbar offers, so content saved elsewhere loads without losing any of it
  private _extensions(): Extension[] {
    const extensions = [marks, heading, lists, link, hr, color, textStyle, alignment, blockquote, codeBlock, image, video];
    if (this.mergeFieldsEnabled) extensions.push(mergeFields(this._mergeFieldLabels()));
    return extensions;
  }

  private _module<T>(name: string): T | undefined {
    return this._modules.get(name) as T | undefined;
  }

  private _featureConfig(): EditorFeatureConfig {
    return {
      codeBlocksEnabled: this.codeBlocksEnabled,
      dividersEnabled: this.dividersEnabled,
      linksEnabled: this.linksEnabled,
      attachmentsEnabled: this.attachmentsEnabled,
      imagesEnabled: this.imagesEnabled,
      videosEnabled: this.videosEnabled,
      datesEnabled: this.datesEnabled,
      emojisEnabled: this.emojisEnabled,
      codeEnabled: this.codeEnabled,
      aiEnabled: this.aiEnabled,
    };
  }

  private _createModules() {
    const host: EditorHost = {
      editor: this._editor,
      container: this.editor,
      getModule: <T, >(name: string) => this._module<T>(name),
      openPicker: (element, anchor) => this._openPicker(element, anchor),
      closePicker: () => this._closePicker(),
    };
    const config = this._featureConfig();
    const form = this.getForm();

    // Toolbar first: the modules after it add their own toolbar handlers
    const toolbar = new Toolbar(host, {config});
    toolbar.setTools(toolsFor(config, this._customTools()));
    this._attachToolbars(toolbar);
    toolbar.addHandler('link', () => this._openPrompt('link'));
    toolbar.addHandler('video', () => this._openPrompt('video'));
    this._modules.set('toolbar', toolbar);
    this._modules.set('contextMenu', new ContextMenu(host));

    const dialog = new Dialog(host, {editorId: this.id});
    dialog.component?.addEventListener('zn-editor-insert', this._handleEditorInsert);
    this._modules.set('dialog', dialog);

    if (this.datesEnabled) this._modules.set('datePicker', new DatePicker(host));
    if (this.emojisEnabled) {
      this._modules.set('emoji', new Emoji(host));
      this._modules.set('headlessEmoji', new HeadlessEmoji(host));
    }
    if (this.aiEnabled) {
      // In the quiet layout Refine sits in the selection bar, so the separate tooltip would only cover it
      const ai = new EditorAI(host, {path: this.aiPath, tooltip: () => this.layout !== 'quiet'});
      toolbar.addHandler('ai-refine', () => ai.openPanel());
      this._modules.set('ai', ai);
    }
    this._modules.set('timeTracking', new TimeTracking(host, {
      startTimeInput: form?.querySelector<HTMLInputElement>('input[name="startTime"]') ?? undefined,
      openTimeInput: form?.querySelector<HTMLInputElement>('input[name="openTime"]') ?? undefined,
    }));
    if (this.attachmentsEnabled) {
      this._modules.set('attachment', new Attachment(host, {
        attachmentInput: form?.querySelector<HTMLInputElement>('input[name="attachments"]') ?? undefined,
        onFileUploaded: () => this._settleUpload(),
        onFileUploadFailed: () => this._settleUpload(),
        stackAt: () => this.stackAttachments,
        upload: (file, options) => {
          this._pendingUploads++;
          window.onbeforeunload = () => 'You have unsaved changes. Are you sure you want to leave?';
          return (this.uploader ?? this._uploadToAttachmentUrl)(file, options);
        },
      }));
    }
  }

  // Asks attachment-url for a presigned upload URL, then sends the file there
  private _uploadToAttachmentUrl: Uploader = async (file, options) => {
    const fd = new FormData();
    fd.append('filename', file.name);
    fd.append('size', file.size.toString());
    fd.append('mimeType', file.type);

    const res = await fetch(this.uploadAttachmentUrl, {method: 'POST', body: fd, signal: options.signal});
    if (!res.ok) throw new Error(`Upload request failed: ${res.status}`);
    const response = await res.json() as {uploadPath: string; uploadUrl: string};

    // resolve relative upload targets against the attachment url so both keep
    // the same base path when the host page rewrites upload-attachment-url (e.g. the
    // kubex console proxying apps under an app base); absolute urls pass through
    const url = new URL(response.uploadUrl, new URL(this.uploadAttachmentUrl, window.location.href)).toString();
    await putFile(url, file, options);
    return {path: response.uploadPath, url};
  };

  private _toggleSource() {
    const source = this.renderRoot.querySelector<HTMLTextAreaElement>('.editor__source')!;
    if (!this._sourceMode) {
      source.value = this.value ?? '';
    } else if (this.documentMode) {
      this._loadDocument(source.value);
    } else {
      // Back in the editor the HTML is reduced to what it can show
      this._editor.setHTML(source.value);
      this._handleTextChange();
    }
    this._sourceMode = !this._sourceMode;
  }

  private _loadDocument(markup: string) {
    const frame = this.documentFrame;
    frame.addEventListener('load', () => {
      const doc = frame.contentDocument!;
      const outlines = doc.createElement('style');
      outlines.id = DOCUMENT_OUTLINES_ID;
      outlines.textContent = 'table,td,th{outline:1px dotted #d3d3d3;outline-offset:-1px}';
      doc.head.append(outlines);
      doc.designMode = 'on';
      doc.addEventListener('input', () => this._handleDocumentInput(/<html[\s>]/i.test(markup)));
      this._fitDocument();
      new ResizeObserver(() => this._fitDocument()).observe(doc.body);
    }, {once: true});
    frame.srcdoc = markup;
  }

  // Grows to the content; the stylesheet's max-height caps it
  private _fitDocument() {
    const frame = this.documentFrame;
    frame.style.height = `${frame.contentDocument?.documentElement.offsetHeight ?? 0}px`;
  }

  private _handleDocumentInput(wholeDocument: boolean) {
    const doc = this.documentFrame.contentDocument!;
    const root = doc.documentElement.cloneNode(true) as HTMLElement;
    root.querySelector(`#${DOCUMENT_OUTLINES_ID}`)?.remove();
    const doctype = doc.doctype ? `<!DOCTYPE ${doc.doctype.name}>\n` : '';
    this.value = wholeDocument ? doctype + root.outerHTML : root.querySelector('body')!.innerHTML;
    this.editorHtml.value = this.value;
    this._cacheContent();
    this.emit('zn-change');
  }

  private _handleSourceInput(e: Event) {
    this.value = (e.target as HTMLTextAreaElement).value;
    this.editorHtml.value = this.value;
    this._cacheContent();
    this.emit('zn-change');
  }

  private _mergeFieldLabels(): Record<string, string> {
    const labels: Record<string, string> = {};
    this.querySelectorAll<ZnEditorQuickAction>('zn-editor-quick-action[slot="context-items"]').forEach(action => {
      if (action.content && action.label) {
        labels[normaliseToken(action.content)] = action.label;
      }
    });
    return labels;
  }

  private _handleTextChange = () => {
    if (this.documentMode || !this._editor) return;
    this.value = this._editor.getHTML();
    this.editorHtml.value = this.value;
    this._cacheContent();
    this.emit('zn-change');
  };

  private _isEmpty(value: string) {
    return value.match(/[^<pbr\s>/]/) === null;
  }

  private _cacheContent() {
    if (!this.storeKey || !this._store) return;
    if (this._isEmpty(this.value)) {
      this._store.remove(this.storeKey);
    } else {
      this._store.set(this.storeKey, this.value);
    }
  }

  private _settleUpload() {
    this._pendingUploads--;
    if (this._pendingUploads === 0) {
      window.onbeforeunload = () => null;
    }
  }

  private _clearCachedContent() {
    if (this.storeKey && this._store) {
      this._store.remove(this.storeKey);
    }
  }

  // Starts again from one plain paragraph, so a message that opened with a heading doesn't leave the next one in it
  private _setText(text: string) {
    this._editor.deleteText(0, this._editor.getLength());
    this._editor.removeFormat(0, this._editor.getLength());
    if (text) this._editor.insertText(0, text);
  }

  // A dragged image shows where it will land: the caret follows the pointer, and goes back if the drag leaves.
  // A drag that carries HTML gets the browser's own drop caret.
  private _dragSelection: TextRange | null | undefined;

  private _handleImageDragOver = (e: DragEvent) => {
    const data = e.dataTransfer;
    if (!this.imagesEnabled || this.readonly || !data || data.types.includes('text/html')) return;
    if (!Array.from(data.items).some(item => item.kind === 'file' && item.type.startsWith('image/'))) return;
    const index = this._editor.indexAtPoint(e.clientX, e.clientY);
    if (index === null) return;
    if (this._dragSelection === undefined) this._dragSelection = this._editor.hasFocus() ? this._editor.getSelection() : null;
    if (this._editor.getSelection()?.index !== index || !this._editor.hasFocus()) this._editor.setSelection(index);
  };

  private _handleImageDragLeave = (e: DragEvent) => {
    if (this._dragSelection === undefined || this.content.contains(e.relatedTarget as Node | null)) return;
    const previous = this._dragSelection;
    this._dragSelection = undefined;
    if (previous) this._editor.setSelection(previous.index, previous.length);
    else this._editor.setSelection(null);
  };

  // Pasted or dropped files: an image goes in the text as the image button puts it, anything else is attached
  private _handleFiles = async (e: Event) => {
    const {files, index} = (e as CustomEvent<{files: File[]; index: number}>).detail;
    const isImage = (file: File) => this.imagesEnabled && file.type.startsWith('image/');
    const taken = files.filter(file => isImage(file) || this.attachmentsEnabled);
    if (!taken.length) return;
    e.preventDefault();
    this._editor.setSelection(index);
    // One at a time, so the text and the tiles keep the order the files came in
    for (const file of taken) {
      if (isImage(file)) await this._module<Toolbar>('toolbar')?.insertImage(file);
      else this._module<Attachment>('attachment')?.addAttachment(file);
    }
  };

  // In a chat, Enter sends the message; Shift+Enter, or an open popup, keeps it for a new line or the popup
  private _handleEnter = (e: KeyboardEvent) => {
    if (e.key !== 'Enter' || e.shiftKey || e.isComposing || this.interactionType !== 'chat') return;
    const popupOpen = this._module<HeadlessEmoji>('headlessEmoji')?.isOpen()
      || this._module<ContextMenu>('contextMenu')?.isOpen()
      || this._module<Dialog>('dialog')?.isOpen();
    if (popupOpen) return;

    const form = this.closest('form');
    const hasText = !!this.value && this.value.trim().length > 0 && !this._isEmpty(this.value);
    const attachmentInput = form?.querySelector('input[name="attachments"]') as HTMLInputElement | null;
    const hasAttachments = !!attachmentInput?.value && attachmentInput.value !== '[]';
    if (!form || (!hasText && !hasAttachments)) return;

    e.preventDefault();
    e.stopPropagation();
    this.emit('zn-submit', {detail: {value: this.value, element: this}});
    form.requestSubmit();
    this._setText('');
  };

  // One anchor that reads the selection live: a new anchor restarts zn-popup, and a drag would restart it every move
  private _bubbleRange: TextRange | null = null;
  private readonly _bubbleAnchor: {getBoundingClientRect: () => DOMRect; contextElement?: Element} = {
    getBoundingClientRect: () => {
      const range = this._bubbleRange;
      return range ? this._editor.getBounds(range.index, range.length) : new DOMRect();
    },
  };

  // The quiet layout's bar follows a selection while the editor, or the bar itself, has focus
  private _updateBubble = () => {
    const bubble = this.bubble;
    if (!bubble) return;
    const range = this._editor.getSelection();
    if (range?.length && !this.readonly) {
      this._bubbleRange = range;
      if (bubble.anchor !== this._bubbleAnchor) {
        this._bubbleAnchor.contextElement = this.content;
        bubble.anchor = this._bubbleAnchor;
      }
      if (bubble.active) void bubble.reposition();
      else bubble.active = true;
    } else if (range || this.readonly) {
      bubble.active = false;
    } else {
      // No reading: the text lost focus, perhaps to the bar itself, or WebKit had no settled selection to report.
      // Look again once focus has landed, and hide only when neither the text nor the bar has it.
      requestAnimationFrame(() => {
        // WebKit's :focus-within misses focus inside the bar's nested shadow roots
        if (!bubble.contains(this.shadowRoot!.activeElement) && !this._editor.hasFocus()) bubble.active = false;
      });
    }
  };

  // Alt+F10 moves the keyboard into the selection bar; Escape there returns to the text
  private _handleBubbleShortcut = (e: KeyboardEvent) => {
    if (e.key !== 'F10' || !e.altKey || !this.bubble?.active) return;
    e.preventDefault();
    this.bubble.querySelector<ToolbarComponent>('zn-toolbar')?.focusFirst();
  };

  private _handleBubbleKeydown(e: KeyboardEvent) {
    if (e.key !== 'Escape' || (e.composedPath() as Element[]).some(el => el.tagName === 'ZN-MENU')) return;
    e.preventDefault();
    e.stopPropagation();
    const range = this._bubbleRange;
    if (range) this._editor.setSelection(range.index, range.length);
    else this._editor.focus();
  }

  private _attachToolbars(toolbar: Toolbar) {
    this.renderRoot.querySelectorAll<ToolbarComponent>('zn-toolbar').forEach(component => toolbar.attach(component));
  }

  // Custom tools are read as data, so each layout can draw them like its own
  private _customTools(): ZnEditorTool[] {
    return Array.from(this.querySelectorAll<ZnEditorTool>(':scope > zn-editor-tool[slot="tools"]'));
  }

  private _refreshTools() {
    const toolbar = this._module<Toolbar>('toolbar');
    toolbar?.setTools(toolsFor(this._featureConfig(), this._customTools()));
  }

  private _openPicker(element: HTMLElement, anchor?: Element) {
    const range = this._editor.getSelection(true)!;
    const caret = {getBoundingClientRect: () => this._editor.getBounds(range.index), contextElement: this.content};
    this.picker.anchor = anchor ?? caret;
    this.picker.querySelector('.editor__picker-body')!.replaceChildren(element);
    this.picker.active = true;
    document.addEventListener('pointerdown', this._closePickerOutside, true);
    document.addEventListener('keydown', this._closePickerOnEscape, true);
  }

  private _closePicker() {
    if (!this.picker?.active) return;
    this.picker.active = false;
    document.removeEventListener('pointerdown', this._closePickerOutside, true);
    document.removeEventListener('keydown', this._closePickerOnEscape, true);
  }

  private _closePickerOutside = (e: PointerEvent) => {
    const path = e.composedPath();
    // The control that opened it reopens it itself, so a press there must not close it first
    if (path.includes(this.picker) || path.includes(this.picker.anchor as EventTarget)) return;
    this._closePicker();
  };

  private _closePickerOnEscape = (e: KeyboardEvent) => {
    if (e.key !== 'Escape') return;
    e.preventDefault();
    e.stopPropagation();
    this._closePicker();
    this._editor.focus();
  };

  private _openPrompt(kind: PromptKind) {
    const range = this._editor.getSelection(true)!;
    const linkRange = kind === 'link' && range.length === 0 ? this._editor.getFormatExtent(range.index, 'link') : null;
    this._promptRange = linkRange ?? range;
    const href = kind === 'link' ? this._editor.getFormat(this._promptRange.index, this._promptRange.length).link : undefined;
    this._promptHasLink = typeof href === 'string';
    this._promptOriginalText = kind === 'link' ? this._editor.getText(this._promptRange.index, this._promptRange.length) : '';

    const box = this.editor.getBoundingClientRect();
    const bounds = this._editor.getBounds(this._promptRange.index, this._promptRange.length);
    this._promptPosition = {top: bounds.bottom - box.top + 6, left: Math.max(0, bounds.left - box.left)};
    this._prompt = kind;
    this.updateComplete.then(() => {
      if (this.promptText) this.promptText.value = this._promptOriginalText;
      this.promptInput.value = typeof href === 'string' ? href : '';
      this.promptInput.focus();
    });
  }

  // Clicking a link opens it for editing; a drag that only ends on one is a selection
  private _handleContentClick = (e: MouseEvent) => {
    if (this.readonly || !(e.target as Element).closest?.('a[href]')) return;
    if (this._editor.getSelection()?.length) return;
    this._openPrompt('link');
  };

  private _closePrompt(refocus = true) {
    const range = this._promptRange;
    this._prompt = null;
    this._promptRange = null;
    if (refocus && range) this._editor.setSelection(range.index, range.length);
  }

  private _applyPrompt() {
    const range = this._promptRange;
    const url = String(this.promptInput.value ?? '').trim();
    if (!range) return;
    if (this._prompt === 'video') {
      if (url) this._editor.insertEmbed(range.index + range.length, 'video', url);
      this._closePrompt();
      return;
    }
    // Clearing the text keeps what was there, or shows the URL for a new link
    const label = String(this.promptText?.value ?? '').trim() || this._promptOriginalText || url;
    // Changed text is retyped, losing formatting inside it; an unchanged link keeps its bold and colour
    if (range.length && label !== this._promptOriginalText) {
      this._editor.deleteText(range.index, range.length);
      this._editor.insertText(range.index, label);
      range.length = label.length;
    } else if (!range.length && url) {
      this._editor.insertText(range.index, label);
      range.length = label.length;
    }
    if (range.length) this._editor.formatText(range.index, range.length, 'link', url || false);
    this._closePrompt();
  }

  private _removeLink() {
    const range = this._promptRange;
    if (range) this._editor.formatText(range.index, range.length, 'link', false);
    this._closePrompt();
  }

  // On capture, ahead of the field's own Escape handling
  private _handlePromptKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this._applyPrompt();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      this._closePrompt();
    }
  }

  // Safari doesn't focus a clicked button, so pressing Save would blur the field and close the prompt before the click
  private _handlePromptMouseDown(e: MouseEvent) {
    if (!(e.target as Element).closest('zn-input')) e.preventDefault();
  }

  // Clicking away leaves the selection where the click put it
  private _handlePromptFocusOut(e: FocusEvent) {
    if (!(e.currentTarget as Element).contains(e.relatedTarget as Node)) this._closePrompt(false);
  }

  private _handleEditorChange(e: OnEvent) {
    const target = e.selectedTarget as HTMLElement;
    if (!target.hasAttribute('editor-mode')) return;

    const editorMode = target.getAttribute('editor-mode');
    if (editorMode !== 'replace' && editorMode !== 'insert') return;

    e.preventDefault();

    const contentContainer = target.getAttribute('editor-content-id');
    if (!contentContainer) return;

    // Find which element contains the content to insert
    // Priority: currentTarget > selectedTarget > target > composedPath > querySelector
    const contentSelector = idSelector(contentContainer);
    const contentElement: Element | null =
      (e.currentTarget instanceof Element && e.currentTarget.closest(contentSelector)) ||
      (e.selectedTarget instanceof Element && e.selectedTarget.closest(contentSelector)) ||
      (e.target instanceof Element && e.target.closest(contentSelector)) ||
      ((e.composedPath()[0] as Element)?.closest(contentSelector)) ||
      deepQuerySelectorAll(contentSelector, document.documentElement, '')[0];
    if (!contentElement) return;

    let content = contentElement.textContent;
    if (contentElement instanceof HTMLInputElement || contentElement instanceof ZnTextarea) {
      content = contentElement.value;
    }
    if (!content || content === '') return;

    this._content = content.trim();

    if (editorMode === 'replace') {
      this._replaceTextAtSelection();
    } else if (editorMode === 'insert') {
      this._insertTextAtSelection();
    }
  }

  private _handleEditorInsert = (e: ZnEditorInsertEvent) => {
    const detail: Partial<ZnEditorInsertEvent['detail']> = e.detail ?? {};
    const mode = detail.mode;
    if (mode !== 'insert' && mode !== 'replace') return;

    e.stopPropagation();

    if (detail.html) {
      this._insertHtml(mode, detail.html);
      return;
    }

    if (detail.text) {
      this._content = detail.text.trim();
      if (mode === 'replace') {
        this._replaceTextAtSelection();
      } else {
        this._insertTextAtSelection();
      }
    }
  };

  private _insertHtml(mode: 'insert' | 'replace', content: string) {
    const editor = this._editor;
    const range = editor.getSelection();

    let index: number;
    if (mode === 'replace') {
      if (range && range.length > 0) {
        editor.deleteText(range.index, range.length);
        index = range.index;
      } else {
        this._setText('');
        index = 0;
      }
    } else {
      index = range ? range.index : this._selectionRange.index;
    }

    editor.setSelection(editor.insertHTML(index, content));
    this._closePopups();
  }

  private _replaceTextAtSelection() {
    const range = this._editor.getSelection();
    if (range && range.length > 0) {
      this._editor.deleteText(range.index, range.length);
      this._editor.insertText(range.index, this._content);
      this._editor.setSelection(range.index + this._content.length);
    } else {
      this._setText(this._content);
      this._editor.setSelection(this._content.length);
    }

    this._closePopups();
  }

  private _insertTextAtSelection() {
    const range = this._editor.getSelection();
    const index = range ? range.index : this._selectionRange.index;
    this._editor.insertText(index, this._content);
    this._editor.setSelection(index + this._content.length);

    this._closePopups();
  }

  private _closePopups() {
    this._module<EditorAI>('ai')?.resetComponent();
    this._module<Dialog>('dialog')?.close();
  }

  private _renderSourceToggle() {
    if (!this.sourceEnabled || this.readonly) return nothing;
    return html`
      <zn-button class="editor__source-toggle"
                 color="transparent"
                 size="small"
                 icon="${this._sourceMode ? 'pencil@lu' : 'code@lu'}"
                 icon-size="16"
                 @click=${this._toggleSource}>${this._sourceMode ? 'Editor' : 'Source'}</zn-button>`;
  }

  private _renderBox() {
    this._box.classList.toggle('editor__box--prefixed', !!this.prefix);
    renderInto(html`
        ${this.prefix ? html`<span class="editor__prefix">${this.prefix}</span>` : ''}
        <div id="editor" x-editor-id="${this.id}" ?hidden=${this._sourceMode || this.documentMode}>
          <div class="editor__content" part="content"></div>
          <div class="editor__prompt"
               role="dialog"
               aria-label=${this._prompt === 'video' ? 'Video' : 'Link'}
               style="top: ${this._promptPosition.top}px; left: ${this._promptPosition.left}px"
               ?hidden=${!this._prompt}
               @keydown=${{handleEvent: (e: KeyboardEvent) => this._handlePromptKeydown(e), capture: true}}
               @mousedown=${this._handlePromptMouseDown}
               @focusout=${this._handlePromptFocusOut}>
            ${this._prompt === 'link' ? html`
              <zn-input class="editor__prompt-text"
                        size="small"
                        label="Text"
                        placeholder="Text to show"></zn-input>` : ''}
            <zn-input class="editor__prompt-url"
                      size="small"
                      type="url"
                      label=${this._prompt === 'video' ? 'Video' : 'Link'}
                      placeholder=${this._prompt === 'video' ? 'Paste a YouTube or Vimeo link' : 'https://'}></zn-input>
            <div class="editor__prompt-actions">
              ${this._prompt === 'link' && this._promptHasLink ? html`
                <zn-button size="small" color="transparent" @click=${this._removeLink}>Remove</zn-button>` : ''}
              <zn-button size="small" @click=${this._applyPrompt}>Save</zn-button>
            </div>
          </div>
        </div>
        ${this.documentMode ? html`
          <iframe class="editor__document" sandbox="allow-same-origin" title="${this.placeholder}"
                  ?hidden=${this._sourceMode}></iframe>` : ''}
        ${this.sourceEnabled ? html`
          <textarea class="editor__source" spellcheck="false" ?hidden=${!this._sourceMode}
                    @input=${this._handleSourceInput}></textarea>` : ''}`, this._box, {host: this});
    return this._box;
  }

  private _renderComposer() {
    const editing = !this._sourceMode && !this.documentMode;
    return html`
      <div class="editor__card">
        ${this._renderBox()}
        ${editing && this._formatOpen ? html`
          <div class="editor__format">
            <zn-toolbar variant="format" compact></zn-toolbar>
          </div>` : nothing}
        <div class="editor__composer-bar">
          ${editing ? html`
            <zn-toolbar variant="bar"></zn-toolbar>
            <zn-button class="editor__format-toggle"
                       color="transparent"
                       icon="a-large-small@lu"
                       icon-size="16"
                       tooltip="Formatting"
                       aria-label="Formatting"
                       aria-expanded=${String(this._formatOpen)}
                       @click=${() => (this._formatOpen = !this._formatOpen)}></zn-button>` : nothing}
          ${this._renderSourceToggle()}
          <div id="action-container" class="editor__composer-actions">
            <slot name="actions"></slot>
          </div>
        </div>
      </div>`;
  }

  private _renderQuiet() {
    const editing = !this._sourceMode && !this.documentMode;
    return html`
      ${this._renderBox()}
      <zn-popup class="editor__bubble"
                placement="top"
                distance="8"
                flip
                shift
                shift-padding="8"
                @keydown=${this._handleBubbleKeydown}
                @focusout=${this._updateBubble}>
        <zn-toolbar variant="bubble"></zn-toolbar>
      </zn-popup>
      <div class="editor__footer">
        ${editing ? html`
          <zn-toolbar variant="bar"></zn-toolbar>
          <span class="editor__hint">Type <kbd>/</kbd> for headings, lists and more</span>` : nothing}
        ${this._renderSourceToggle()}
        <div id="action-container" class="editor__footer-actions">
          <slot name="actions"></slot>
        </div>
      </div>`;
  }

  render() {
    const composer = this.layout === 'composer';
    const quiet = this.layout === 'quiet';
    return html`
      ${composer || quiet ? nothing : html`
        <div class="editor__bar">
          <zn-toolbar id="toolbar"
                      variant="segmented"
                      ?compact=${this.compact}
                      ?data-source=${this._sourceMode || this.documentMode}></zn-toolbar>
          ${this._renderSourceToggle()}
        </div>`}
      <slot name="context-items" style="display: none;"></slot>
      <slot name="tools" style="display: none;" @slotchange=${this._refreshTools}></slot>
      <zn-popup class="editor__picker"
                placement="bottom-start"
                distance="6"
                flip
                shift
                shift-padding="8">
        <div class="editor__picker-body"></div>
      </zn-popup>
      ${composer ? this._renderComposer() : quiet ? this._renderQuiet() : html`
        ${this._renderBox()}
        <div id="action-container">
          <slot name="actions"></slot>
        </div>`}
      <input type="text" id="editorHtml" name="${this.name}" value="${this.value}" style="display: none;">
      <div class="form-control form-control--medium form-control--has-help-text"
           ?hidden=${!this.helpText && !this.hasSlotController.test('help-text')}>
        <div part="form-control-help-text" class="form-control__help-text">
          <slot name="help-text">${this.helpText}</slot>
        </div>
      </div>
    `;
  }
}
