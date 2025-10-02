import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {FormControlController} from '../../internal/form';
import {on} from "../../utilities/on";
import {property, query} from 'lit/decorators.js';
import Attachment from "./modules/attachment/attachment";
import CannedResponse from "./modules/canned-response/canned-response";
import ContextMenu from "./modules/context-menu/context-menu";
import CustomToolbar from "./modules/toolbar/toolbar";
import DatePicker from "./modules/date-picker/date-picker";
import DragAndDrop from "./modules/drag-drop/drag-drop";
import Emoji from "./modules/emoji/emoji";
import HeadlessEmoji from "./modules/emoji/headless/headless-emoji";
import ImageResize from "./modules/image-resize/image-resize";
import Quill from "quill";
import QuillAI from "./modules/ai";
import TimeTracking from "./modules/time-tracking/time-tracking";
import ZincElement from '../../internal/zinc-element';
import type {OnEvent} from "../../utilities/on";
import type {ZincFormControl} from '../../internal/zinc-element';
import type ContextMenuComponent from "./modules/context-menu/context-menu-component";
import type HeadlessEmojiComponent from "./modules/emoji/headless/headless-emoji.component";
import type ToolbarComponent from "./modules/toolbar/toolbar.component";

import styles from './editor.scss';

export interface Commands {
  title: string;
  content: string;
  command: string;
  labels?: string[];
  count: string;
}

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/editor
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-example
 *
 * @event zn-event-name - Emitted as an example.
 *
 * @slot - The default slot.
 * @slot example - An example slot.
 *
 * @csspart base - The component's base wrapper.
 *
 * @cssproperty --example - An example CSS custom property.
 */
export default class ZnEditor extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);

  private formControlController = new FormControlController(this, {});

  @query('#editor')
  private editor: HTMLElement;

  @query('#editorHtml')
  private editorHtml: HTMLTextAreaElement;

  @query('#toolbar')
  private toolbar: ToolbarComponent;

  @property() name: string;
  @property() value: string;

  @property({attribute: 'interaction-type', type: String})
  interactionType: 'ticket' | 'chat' = 'chat';

  @property({attribute: 'canned-responses', type: Array})
  cannedResponses: any[];

  @property({attribute: 'canned-responses-url'}) cannedResponsesUri: string;

  @property({attribute: 'attachment-url', type: String})
  uploadAttachmentUrl: string;

  @property({attribute: 'ai-path'}) aiPath: string = '';

  private quillElement: Quill;
  private _commands: Commands[] = [];

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

  protected async firstUpdated(_changedProperties: PropertyValues) {
    this.formControlController.updateValidity();

    const bindings = this._getQuillKeyboardBindings();


    // TODO: Change ID from abc to actual editor ID
    on(document, 'click', `[editor-id="abc"]`, (e: OnEvent) => {
      this._handleEditorChange(e);
    });

    Quill.register({'modules/toolbar': CustomToolbar}, true);
    Quill.register({'modules/datePicker': DatePicker}, true);
    Quill.register({'modules/emoji': Emoji}, true);
    Quill.register({'modules/headlessEmoji': HeadlessEmoji}, true);
    Quill.register({'modules/attachment': Attachment}, true);
    Quill.register({'modules/timeTracking': TimeTracking}, true);
    Quill.register({'modules/dragAndDrop': DragAndDrop}, true);
    Quill.register({'modules/imageResize': ImageResize}, true);
    Quill.register({'modules/contextMenu': ContextMenu}, true);
    Quill.register({'modules/cannedResponse': CannedResponse}, true);

    /* AI Modules */
    Quill.register('modules/ai', QuillAI as any, true);

    // Register a custom HR blot so we can insert an inline horizontal rule block
    const BlockEmbed = Quill.import('blots/block/embed') as { new(...args: any[]): any };

    class HrBlot extends BlockEmbed {
      static blotName = 'hr';
      static tagName = 'HR';
      static className = 'ql-hr';

      static create(): HTMLElement {
        const node = document.createElement('hr');
        node.classList.add('ql-hr');
        return node;
      }
    }

    Quill.register({'formats/hr': HrBlot}, true);

    const attachmentInput = this.getForm()?.querySelector('input[name="attachments"]');
    const startTimeInput = this.getForm()?.querySelector('input[name="startTime"]');
    const openTimeInput = this.getForm()?.querySelector('input[name="openTime"]');

    if (this.cannedResponsesUri) {
      await this._fetchCannedResponses();
    }

    const topCannedResponses = (this._commands || []).slice(0, 3);

    const quill = new Quill(this.editor, {
      modules: {
        toolbar: {
          container: this.toolbar,
        },
        contextMenu: {
          commands: topCannedResponses
        },
        keyboard: {
          bindings: bindings
        },
        cannedResponse: {
          commands: this._commands // TODO: Have the module do a fetch for these results
        },
        emoji: {},
        headlessEmoji: {},
        datePicker: {},
        ai: {
          path: this.aiPath
        },
        timeTracking: {
          startTimeInput: startTimeInput as HTMLInputElement,
          openTimeInput: openTimeInput as HTMLInputElement
        },
        attachment: {
          attachmentInput: attachmentInput,
          onFileUploaded: () => {
            window.onbeforeunload = () => null;
          },
          upload: (file: File) => {
            window.onbeforeunload = () => 'You have unsaved changes. Are you sure you want to leave?';
            return new Promise((resolve, _) => {
              const fd = new FormData();
              fd.append('filename', file.name);
              fd.append('size', file.size.toString());
              fd.append('mimeType', file.type);

              const xhr = new XMLHttpRequest();
              xhr.open('POST', this.uploadAttachmentUrl, true);
              xhr.onload = () => {
                if (xhr.status === 200) {
                  const response = JSON.parse(xhr.responseText);
                  resolve({path: response.uploadPath, url: response.uploadUrl, filename: response.originalFilename});
                }
              };
              xhr.send(fd);
            });
          },
        },
        imageResize: {},
        history: {}
      },
      placeholder: 'Compose your reply...',
      theme: 'snow',
      bounds: this.editor,
    });

    this.quillElement = quill;

    this._supplyPlaceholderDialog();

    // @ts-expect-error getSelection is available it lies.
    const hasShadowRootSelection = !!(document.createElement('div').attachShadow({mode: 'open'}).getSelection);
    // Each browser engine has a different implementation for retrieving the Range
    const getNativeRange = (rootNode: any): any => {
      try {
        if (hasShadowRootSelection) {
          // In Chromium, the shadow root has a getSelection function which returns the range
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
          return rootNode?.getSelection()?.getRangeAt(0);
        } else {
          const selection = window.getSelection();
          // @ts-expect-error getComposedRanges is available it lies.
          if (selection.getComposedRanges) {
            // Webkit range retrieval is done with getComposedRanges (see: https://bugs.webkit.org/show_bug.cgi?id=163921)
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            return selection?.getComposedRanges(rootNode)[0];
          } else {
            // Gecko implements the range API properly in Native Shadow: https://developer.mozilla.org/en-US/docs/Web/API/Selection/getRangeAt
            // @ts-ignore
            return selection.getRangeAt(0);
          }
        }
      } catch {
        return null;
      }
    }

    /**
     * Original implementation uses document.active element which does not work in Native Shadow.
     * Replace document.activeElement with shadowRoot.activeElement
     **/
    quill.selection.hasFocus = function () {
      const rootNode = quill.root.getRootNode() as Document | ShadowRoot;
      return rootNode.activeElement === quill.root;
    }

    /**
     * Original implementation uses document.getSelection which does not work in Native Shadow.
     * Replace document.getSelection with shadow dom equivalent (different for each browser)
     **/
    quill.selection.getNativeRange = function () {
      const rootNode = quill.root.getRootNode();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const nativeRange = getNativeRange(rootNode);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return nativeRange ? quill.selection.normalizeNative(nativeRange) : null;
    };

    /**
     * Original implementation relies on Selection.addRange to programmatically set the range, which does not work
     * in Webkit with Native Shadow. Selection.addRange works fine in Chromium and Gecko.
     **/
    quill.selection.setNativeRange = function (startNode: Element, startOffset: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,prefer-rest-params
      let endNode: any = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : startNode;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,prefer-rest-params
      let endOffset: any = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : startOffset;
      // eslint-disable-next-line prefer-rest-params,@typescript-eslint/no-unsafe-assignment
      const force: any = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (startNode !== null && (quill.selection.root.parentNode === null || startNode.parentNode === null || endNode.parentNode === null)) {
        return;
      }
      const selection = document.getSelection();
      if (selection === null) return;
      if (startNode !== null) {
        if (!quill.selection.hasFocus()) quill.selection.root.focus();
        const native = quill.selection.getNativeRange()?.native;
        // @ts-ignore
        if (native === null || force || startNode !== native?.startContainer || startOffset !== native.startOffset || endNode !== native.endContainer || endOffset !== native.endOffset) {
          if (startNode.tagName === "BR") {
            // @ts-ignore
            startOffset = [].indexOf.call(startNode.parentNode.childNodes, startNode);
            startNode = startNode.parentNode as Element;
          }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (endNode.tagName === "BR") {
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
            endOffset = [].indexOf.call(endNode.parentNode.childNodes, endNode);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
            endNode = endNode.parentNode;
          }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          selection.setBaseAndExtent(startNode, startOffset, endNode, endOffset);
        }
      } else {
        selection.removeAllRanges();
        quill.selection.root.blur();
        document.body.focus();
      }
    }

    /**
     * Subscribe to selection change separately, because emitter in Quill doesn't catch this event in Shadow DOM
     **/
    document.addEventListener('selectionchange', () => this.quillElement.selection.update());

    document.addEventListener('zn-editor-update', this._handleTextChange.bind(this));
    quill.on('text-change', this._handleTextChange.bind(this));

    const delta = quill.clipboard.convert({html: this.value});
    quill.setContents(delta, Quill.sources.SILENT);

    this.emit('zn-element-added', {detail: {element: this.editor}});
    super.firstUpdated(_changedProperties);
  }

  private _handleTextChange() {
    this.value = this.quillElement.root.innerHTML;
    this.editorHtml.value = this.value;
    this.emit('zn-change');
  }

  private _getQuillKeyboardBindings() {
    const bindings = {
      'remove-formatting': {
        key: 'V',
        shiftKey: true,
        handler: (_range: any, context: any) => {
          const clipboard = context.event.clipboardData;
          const text = clipboard.getData('text/plain');
          const html = clipboard.getData('text/html');
          const delta = this.quillElement.clipboard.convert({html: html, text: text});
          this.quillElement.setContents(delta, 'silent');
          this.quillElement.setSelection(delta.length(), Quill.sources.SILENT);
        }
      },
    };

    const empty = (value: string) => {
      const match = value.match(/[^<pbr\s>/]/);
      return match === null;
    };

    // Always add an Enter binding to support emoji selection in all interaction types
    // @ts-expect-error bindings has no type
    bindings['enter'] = {
      key: 'Enter',
      shiftKey: false,
      handler: () => {
        const emoji = document.querySelector('zn-headless-emoji') as HeadlessEmojiComponent | null;
        const isEmojiOpen = emoji?.open ?? false;
        const contextMenu = document.querySelector('zn-context-menu') as ContextMenuComponent | null;
        const isContextMenuOpen = contextMenu?.open ?? false;
        if (isEmojiOpen || isContextMenuOpen) {
          return false;
        }

        if (this.interactionType === 'chat') {
          const form = this.closest('form');
          if (form && this.value && this.value.trim().length > 0 && !empty(this.value)) {
            this.emit('zn-submit', {detail: {value: this.value, element: this}});
            form.requestSubmit();
            this.quillElement.setText('');
            // prevent default Enter (submit completed)
            return false;
          }
          // If we didn't submit, allow default so Enter inserts newline
          return true;
        }

        // For non-chat interactions, allow default behavior (newline)
        return true;
      },
    };

    return bindings;
  }

  private _supplyPlaceholderDialog() {
    const placeholderItems: HTMLElement[] = Array.prototype.slice.call(this.shadowRoot?.querySelectorAll('.ql-placeholder .ql-picker-item'));
    placeholderItems.forEach((item) => {
      item.textContent = item.dataset.value ?? ''
    });
    placeholderItems.forEach((item) => item.classList.remove('ql-selected'));
  }

  private async _fetchCannedResponses() {
    try {
      const response = await fetch(this.cannedResponsesUri);
      this._commands = await response.json() as Commands[];
    } catch (error) {
      console.error('Error fetching canned responses', error);
    }
  }

  private _handleEditorChange(target: HTMLElement) {
    const editorMode = target.getAttribute('editor-mode');
    if (!editorMode) return;

    const contentContainer = target.getAttribute('editor-click');
    if (!contentContainer) return;

    const contentElement = document.querySelector(contentContainer);
    if (!contentElement) return;

    const content = contentElement.textContent;
    if (!content || content === '') return;

    this._content = content;

    if (editorMode === 'replace') {
      this._replaceTextAtSelection();
    } else if (editorMode === 'insert') {
      this._insertTextAtSelection();
    }
  }

  private _replaceTextAtSelection() {
    const range = this.quillElement.getSelection();
    if (range) {
      this.quillElement.deleteText(range.index, range.length);
      this.quillElement.insertText(range.index, this._content || '');
      this.quillElement.setSelection(range.index + (this._content.length || 0), 0);
    }
  }

  private _insertTextAtSelection() {
    const range = this.quillElement.getSelection();
    if (range) {
      this.quillElement.insertText(range.index, this._content || '');
      this.quillElement.setSelection(range.index + (this._content.length || 0), 0);
    }
  }

  render() {
    return html`
      <zn-toolbar id="toolbar"></zn-toolbar>
      <div id="editor"></div>
      <input type="text" id="editorHtml" name="${this.name}" value="${this.value}" style="display: none;">
      <div id="action-container" class="ql-toolbar ql-snow">
        <slot name="actions"></slot>
      </div>
    `;
  }
}
