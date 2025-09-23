import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {FormControlController} from '../../internal/form';
import {init, Picker, SearchIndex} from 'emoji-mart';
import {property, query} from 'lit/decorators.js';
import AirDatepicker from "air-datepicker";
import AttachmentModule from "./modules/attachment-module";
import data from '@emoji-mart/data';
import DialogModule from "./modules/dialog-module/dialog-module";
import DragAndDropModule from "./modules/drag-drop-module";
import ImageResizeModule from "./modules/image-resize-module/image-resize-module";
import MenuModule from "./modules/menu-module/menu-module";
import Quill from "quill";
import TimeTrackingModule from "./modules/time-tracking-module";
import ZincElement from '../../internal/zinc-element';
import type {ZincFormControl} from '../../internal/zinc-element';
import type DialogModuleComponent from "./modules/dialog-module/dialog-module.component";
import type MenuModuleComponent from "./modules/menu-module/menu-module.component";
import type Toolbar from "quill/modules/toolbar";
import type ZnEditorToolbar from "./toolbar";
import type ZnMenuItem from "../menu-item";

import styles from './editor.scss';

export interface CannedResponse {
  title: string;
  content: string;
  command: string;
  labels?: string[];
  count: string;
}

interface Emoji {
  native?: string;
  skins?: { native?: string }[];
  id?: string;
  shortcodes?: string;
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
  private toolbar: ZnEditorToolbar;

  @property() name: string;
  @property() value: string;

  @property({attribute: 'interaction-type', type: String})
  interactionType: 'ticket' | 'chat' = 'chat';

  @property({attribute: 'canned-responses', type: Array})
  cannedResponses: any[];

  @property({attribute: 'canned-responses-url'}) cannedResponsesUri: string;

  @property({attribute: 'attachment-url', type: String})
  uploadAttachmentUrl: string;

  private quillElement: Quill;
  private _commands: CannedResponse[] = [];
  private _datePickerInstance: AirDatepicker<HTMLElement>;

  // Emoji search popup state
  private _emojiPopupEl: HTMLDivElement | null = null;
  private _emojiActive = false;
  private _emojiStartIndex = -1;
  private _emojiQuery = '';
  private _emojiActiveIndex = -1;

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

    // Initialize emoji-mart headless index for search
    try {
      await init({data: data});
    } catch (e) {
      // ignore if already initialized
    }

    const bindings = this._getQuillKeyboardBindings();

    Quill.register('modules/dialogModule', DialogModule as any, true);
    Quill.register('modules/menuModule', MenuModule as any, true);
    Quill.register('modules/attachmentModule', AttachmentModule as any, true);
    Quill.register('modules/timeTrackingModule', TimeTrackingModule as any, true);
    Quill.register('modules/dragAndDropModule', DragAndDropModule as any, true);
    Quill.register('modules/imageResizeModule', ImageResizeModule as any, true);

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

    const quill = new Quill(this.editor, {
      modules: {
        toolbar: {
          container: this.toolbar,
          handlers: {
            'attachment': () => null,
            'divider': () => this._insertDivider(),
            'redo': () => this.quillElement.history.redo(),
            'undo': () => this.quillElement.history.undo(),
          }
        },
        keyboard: {
          bindings: bindings
        },
        dialogModule: {
          commands: this._commands
        },
        menuModule: {
          commands: this._commands
        },
        timeTrackingModule: {
          startTimeInput: startTimeInput as HTMLInputElement,
          openTimeInput: openTimeInput as HTMLInputElement
        },
        attachmentModule: {
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
        imageResizeModule: {},
        history: {}
      },
      placeholder: 'Compose your reply...',
      theme: 'snow',
      bounds: this.editor,
    });

    this.quillElement = quill;

    this._attachToolbarHandlers(quill);
    this._supplyPlaceholderDialog();
    this._initEmojiPicker();
    this._initDatePicker();
    this._initEmojiSearch();

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
        const native = (quill.selection.getNativeRange() || {}).native;
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
    quill.on('selection-change', () => this._syncToolbarState());
    // Ensure toolbar reflects current formats when the editor is clicked
    quill.root?.addEventListener('click', () => this._syncToolbarState());

    const delta = quill.clipboard.convert({html: this.value});
    quill.setContents(delta, Quill.sources.SILENT);
    // Sync initial toolbar state with current selection/formats
    this._syncToolbarState();

    this.emit('zn-element-added', {detail: {element: this.editor}});
    super.firstUpdated(_changedProperties);
  }

  protected updated(changed: PropertyValues) {
    if (changed.has('t')) {
      this._initEmojiPicker();
      this._initDatePicker();
    }
  }

  private _handleTextChange() {
    this.value = this.quillElement.root.innerHTML;
    this.editorHtml.value = this.value;
    this.emit('zn-change');
    // Keep toolbar state in sync after text changes
    this._syncToolbarState();
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
      handler: (_range: any, context: any) => {
        // If emoji popup is active, insert the currently targeted emoji option
        if (this._emojiActive) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const e: KeyboardEvent | undefined = context?.event as KeyboardEvent | undefined;
          try {
            e?.preventDefault?.();
            e?.stopPropagation?.();
          } catch {
            // no-op
          }
          const activeEl = this._getActiveEmojiItem();
          const firstEl = this._emojiPopupEl?.querySelector('[data-emoji-item]') as HTMLElement | null;
          const target = activeEl ?? firstEl;
          if (target) {
            target.click();
          }

          return false;
        }

        if (this.interactionType === 'chat') {
          const dialog = document.querySelector('zn-dialog-module') as DialogModuleComponent | null;
          const isDialogOpen = dialog?.open ?? false;
          const menu = document.querySelector('zn-menu-module') as MenuModuleComponent | null;
          const isMenuOpen = menu?.open ?? false;
          if (!isMenuOpen && !isDialogOpen) {
            const form = this.closest('form');
            if (form && this.value && this.value.trim().length > 0 && !empty(this.value)) {
              this.emit('zn-submit', {detail: {value: this.value, element: this}});
              form.requestSubmit();
              this.quillElement.setText('');
              // prevent default Enter (submit completed)
              return false;
            }
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

  private _updateMenuCheckedState(selector: string, matchAttr: string, wanted: string | string[] | null) {
    const toolbarShadowRoot = this.toolbar.shadowRoot;
    const items = toolbarShadowRoot?.querySelectorAll(selector) as NodeListOf<ZnMenuItem> | undefined;
    if (!items?.length) return;

    const wantedValues: string[] = wanted === null ? [] : Array.isArray(wanted) ? wanted : [wanted];

    items.forEach((item: ZnMenuItem) => {
      const value = item.getAttribute(matchAttr) ?? '';
      if (item.getAttribute('type') === 'checkbox') {
        item.checked = wantedValues.includes(value);
      }
    });
  }

  private _updateDropdownTrigger(dropdownSelector: string, defaultIconSrc: string) {
    const toolbarShadowRoot = this.toolbar.shadowRoot;
    const dropdown = toolbarShadowRoot?.querySelector(dropdownSelector) as HTMLElement | null;
    if (!dropdown) return;

    const trigger = dropdown.querySelector('zn-button[slot="trigger"]') as HTMLElement | null;
    if (!trigger) return;

    const menu = dropdown.querySelector('zn-menu');
    const items = menu?.querySelectorAll('zn-menu-item') as NodeListOf<ZnMenuItem> | undefined;

    let iconSrc = defaultIconSrc;
    let iconColor = 'default';
    if (items?.length) {
      items.forEach((item: ZnMenuItem) => {
        const checked = item.checked ?? (item.hasAttribute('checked'));
        if (checked) {
          const icon = item.querySelector('zn-icon')!;
          iconSrc = icon?.getAttribute('src') ?? iconSrc;
          iconColor = 'primary';
        }
      });
    }

    trigger.innerHTML = `<zn-icon src="${iconSrc}" color="${iconColor}" size="18"></zn-icon>`;
  }

  private _syncToolbarState() {
    if (!this.quillElement) return;
    const range = this.quillElement.getSelection();
    if (!range) return;

    const formats: Record<string, any> = this.quillElement.getFormat(range);
    if (!formats) return;

    this._syncButtonState('format_bold', !!formats.bold);
    this._syncButtonState('format_italic', !!formats.italic);
    this._syncButtonState('format_underlined', !!formats.underline);

    this._updateHeadingFormatMenu(formats);
    this._updateListFormatMenu(formats);
    this._updateTextFormatMenu(formats);
    this._updateColorFormatMenu(formats);

    this._updateDropdownTrigger('zn-dropdown.toolbar__header-dropdown', 'match_case');
    this._updateDropdownTrigger('zn-dropdown.toolbar__list-dropdown', 'lists');
  }

  private _updateHeadingFormatMenu(formats: Record<string, any>) {
    const wanted = formats.header ? String(formats.header) : ''; // Empty string for text normal
    this._updateMenuCheckedState('zn-dropdown.toolbar__header-dropdown zn-menu zn-menu-item[data-format]', 'data-format-type', wanted);
  }

  private _updateListFormatMenu(formats: Record<string, any>) {
    const list = formats.list as string | null;
    const listValue = (list === 'ordered' || list === 'bullet' || list === 'checked') ? list : null;
    this._updateMenuCheckedState('zn-dropdown.toolbar__list-dropdown zn-menu zn-menu-item[data-format]', 'data-format-type', listValue);
  }

  private _updateTextFormatMenu(formats: Record<string, any>) {
    const selector = 'zn-dropdown.toolbar__format-dropdown zn-menu zn-menu-item[data-format]';
    const attr = 'data-format';
    const wanted = this._getTextFormats(formats);

    this._updateMenuCheckedState(selector, attr, wanted);
  }

  private _updateColorFormatMenu(formats: Record<string, any>) {
    const color = (typeof formats.color === 'string') ? formats.color : '';
    this._updateMenuCheckedState('zn-dropdown.toolbar__color-dropdown zn-menu zn-menu-item[data-format]', 'data-format-type', color);
  }

  private _getTextFormats(formats: Record<string, any>) {
    const wanted: string[] = [];
    if (formats.strike) {
      wanted.push('strike');
    }
    if (formats.blockquote) {
      wanted.push('blockquote');
    }
    if (formats.code) {
      wanted.push('code');
    }
    if (Object.prototype.hasOwnProperty.call(formats, 'code-block')) {
      wanted.push('code-block');
    }
    return wanted;
  }

  private _attachToolbarHandlers(quill: Quill) {
    const toolbarModule = quill.getModule('toolbar') as Toolbar | undefined;
    if (!toolbarModule) return;

    const callFormat = (key: string, value?: string | boolean | undefined) => {
      const handler = (toolbarModule.handlers?.[key] as ((value?: any) => void) | undefined);
      if (value === undefined) {
        if (key === 'header' || key === 'color') {
          value = false; // False for text normal or default color
        }
        if (key === 'link') {
          value = true; // True for creating a link
        }
      }
      if (typeof handler === 'function') {
        handler.call(toolbarModule, value);
        return;
      }
      if (key === 'clean') {
        const range = this.quillElement.getSelection();
        if (range) {
          this.quillElement.removeFormat(range.index, range.length || 0);
        } else {
          this.quillElement.removeFormat(0, this.quillElement.getLength());
        }
        return;
      }
      const range = this.quillElement.getSelection();
      const formats: Record<string, unknown> = range ? this.quillElement.getFormat(range) : {};
      const current = formats[key];
      const next: boolean | string | number = value !== undefined ? value as boolean | string | number : !(current as boolean);
      this.quillElement.format(key, next);
    };

    const toolbarShadowRoot = this.toolbar.shadowRoot;

    const formatters = toolbarShadowRoot?.querySelectorAll('[data-format]') ?? [];
    if (formatters) {
      formatters.forEach((formatter: Element) => {
        formatter.addEventListener('click', (e) => {
          e.preventDefault();
          const target = e.currentTarget as HTMLElement | null;
          if (!target) return;

          const format = target.getAttribute('data-format');
          if (!format) return;

          const type: string | undefined = target.getAttribute('data-format-type') ?? undefined;
          callFormat(format, type);
        });
      });
    }
  }

  private _syncButtonState(icon: string, active: boolean) {
    const el = this.toolbar.shadowRoot?.querySelector(`zn-button[icon="${icon}"]`) as HTMLElement | null;
    if (!el) return;
    if (active) {
      el.classList.add('ql-active');
      el.setAttribute('icon-color', 'primary');
    } else {
      el.classList.remove('ql-active');
      el.removeAttribute('icon-color');
    }
  }

  private async _fetchCannedResponses() {
    try {
      const response = await fetch(this.cannedResponsesUri);
      this._commands = await response.json() as CannedResponse[];
    } catch (error) {
      console.error('Error fetching canned responses', error);
    }
  }

  private _initEmojiPicker() {
    const container = this.toolbar?.shadowRoot?.querySelector('.emoji-picker') as HTMLElement | null;
    if (!container) return;

    container.innerHTML = '';

    // eslint-disable-next-line no-new
    new Picker({
      parent: container,
      data: data as Record<string, unknown>,
      previewPosition: 'none',
      skinTonePosition: 'none',
      theme: this.t === 'dark' ? 'dark' : 'light',
      set: 'native',
      icons: 'solid',
      onEmojiSelect: (emoji: Emoji) => this._onEmojiSelect(emoji)
    });
  }

  private _onEmojiSelect(emoji: Emoji | null) {
    try {
      const text: string = emoji?.native ?? emoji?.skins?.[0]?.native ?? '';
      if (!text || !this.quillElement) return;
      const range = this.quillElement.getSelection(true);
      if (range) {
        this.quillElement.insertText(range.index, text, 'user');
        this.quillElement.setSelection(range.index + text.length, 0, 'user');
      } else {
        const index = Math.max(0, this.quillElement.getLength() - 1);
        this.quillElement.insertText(index, text, 'user');
        this.quillElement.setSelection(index + text.length, 0, 'user');
      }
    } catch (e) {
      // no-op
    }
  }

  private _initDatePicker() {
    const container = this.toolbar?.shadowRoot?.querySelector('.date-picker') as HTMLElement | null;
    if (!container) return;

    if (this._datePickerInstance) {
      if (Object.prototype.hasOwnProperty.call(this._datePickerInstance, 'destroy')) {
        this._datePickerInstance.destroy();
      }
    }

    container.innerHTML = '';

    // eslint-disable-next-line no-new
    this._datePickerInstance = new AirDatepicker(container, {
      inline: true,
      locale: {
        days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
        months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        today: 'Today',
        clear: 'Clear',
        dateFormat: 'MM/dd/yyyy',
        timeFormat: 'hh:ii aa',
        firstDay: 0
      },
      onSelect: ({formattedDate}) => this._onDateSelect(formattedDate)
    });
  }

  private _onDateSelect(formattedDate: string | string[]) {
    try {
      if (!formattedDate || !this.quillElement) return;
      const range = this.quillElement.getSelection(true);
      if (range) {
        const text = Array.isArray(formattedDate) ? formattedDate.join(', ') : formattedDate;
        this.quillElement.insertText(range.index, text, 'user');
        this.quillElement.setSelection(range.index + text.length, 0, 'user');
      } else {
        const index = Math.max(0, this.quillElement.getLength() - 1);
        const text = Array.isArray(formattedDate) ? formattedDate.join(', ') : formattedDate;
        this.quillElement.insertText(index, text, 'user');
        this.quillElement.setSelection(index + text.length, 0, 'user');
      }
    } catch (e) {
      // no-op
    }
  }

  // ===== Emoji ':' headless search popup =====
  private _initEmojiSearch() {
    try {
      this._ensureEmojiPopup();
      if (!this.quillElement) return;

      this.quillElement.on('text-change', () => this._maybeUpdateEmojiSearch());
      this.quillElement.on('selection-change', () => this._maybeUpdateEmojiSearch());

      // Keyboard interactions: Up/Down to navigate, Enter to select, Escape to close
      this.quillElement.root.addEventListener('keydown', (e: KeyboardEvent) => {
        if (!this._emojiActive) return;

        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          this._hideEmojiPopup();
          return;
        }

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          e.stopPropagation();
          const items = this._getEmojiItems();
          if (items.length) {
            const next = this._emojiActiveIndex < 0 ? 0 : this._emojiActiveIndex + 1;
            this._setActiveEmojiIndex(next);
          }
          return;
        }

        if (e.key === 'ArrowUp') {
          e.preventDefault();
          e.stopPropagation();
          const items = this._getEmojiItems();
          if (items.length) {
            const prev = this._emojiActiveIndex < 0 ? items.length - 1 : this._emojiActiveIndex - 1;
            this._setActiveEmojiIndex(prev);
          }
        }
/*
        if (e.key === 'Enter') {
          const activeEl = this._getActiveEmojiItem();
          const target = activeEl ?? (this._emojiPopupEl?.querySelector('[data-emoji-item]') as HTMLElement | null);

          if (target) {
            e.stopPropagation();
            e.preventDefault();
            target.click();
          }
        }*/
      });
    } catch (e) {
      // no-op
    }
  }

  private _ensureEmojiPopup() {
    if (this._emojiPopupEl) return;
    const container = this.editor;
    const el = document.createElement('div');
    el.id = 'emoji-search-popup';
    el.style.position = 'absolute';
    el.style.zIndex = '10000';
    el.style.background = 'var(--zn-panel-bg, #fff)';
    el.style.border = '1px solid var(--zn-border, rgba(0,0,0,0.12))';
    el.style.borderRadius = '8px';
    el.style.boxShadow = 'var(--zn-shadow-medium)';
    el.style.padding = '6px';
    el.style.maxHeight = '220px';
    el.style.overflowY = 'auto';
    el.style.minWidth = '180px';
    el.style.display = 'none';
    el.setAttribute('role', 'listbox');

    container.appendChild(el);
    this._emojiPopupEl = el;

    // Hide when clicking outside
    const root = this.getRootNode() as Document | ShadowRoot;
    root.addEventListener('click', (ev: Event) => {
      if (!this._emojiPopupEl || !this._emojiActive) return;

      const path = ev.composedPath?.() ?? [];
      if (!path.includes(this._emojiPopupEl) && !path.includes(this.quillElement.root)) {
        this._hideEmojiPopup();
      }
    });
  }

  private _maybeUpdateEmojiSearch() {
    if (!this.quillElement) return;

    const queryInfo = this._getEmojiQuery();
    if (!queryInfo) {
      this._hideEmojiPopup();
      return;
    }

    const {start, emojiQuery} = queryInfo;
    this._emojiStartIndex = start;
    this._emojiQuery = emojiQuery;
    this._emojiActive = true;
    void this._performEmojiSearch(this._emojiQuery);
    // Position near caret
    const sel = this.quillElement.getSelection();
    if (sel) {
      const bounds = this.quillElement.getBounds(sel.index);
      if (bounds) {
        this._positionEmojiPopup(bounds);
      }
    }
  }

  private _positionEmojiPopup(bounds: { left: number; top: number; bottom: number; height?: number }) {
    if (!this._emojiPopupEl) return;
    // Place below caret, aligned left
    this._emojiPopupEl.style.left = `${Math.max(0, bounds.left)}px`;
    this._emojiPopupEl.style.top = `${bounds.bottom + 4}px`;
  }

  private _getEmojiQuery(): { start: number; emojiQuery: string } | null {
    try {
      const sel = this.quillElement.getSelection();
      if (!sel) return null;

      const cursor = sel.index;
      const characterLimit = 50;
      const textBefore = this.quillElement.getText(Math.max(0, cursor - characterLimit), Math.min(characterLimit, cursor));
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

  private async _performEmojiSearch(value: string) {
    if (!this._emojiPopupEl) {
      this._ensureEmojiPopup();
    }
    if (!this._emojiPopupEl) return;

    try {
      const results = await SearchIndex.search(value) as Emoji[];
      this._renderEmojiResults(results);
    } catch (e) {
      this._renderEmojiResults(null);
    }
  }

  private _renderEmojiResults(results: Emoji[] | null) {
    if (!this._emojiPopupEl) return;

    this._emojiPopupEl.innerHTML = '';

    const makeItem = (emojiChar: string, label: string, index: number) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.setAttribute('data-emoji-item', '');
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', 'false');
      item.dataset.index = String(index);
      item.style.display = 'flex';
      item.style.alignItems = 'center';
      item.style.gap = '8px';
      item.style.padding = '6px 8px';
      item.style.width = '100%';
      item.style.border = 'none';
      item.style.background = 'transparent';
      item.style.cursor = 'pointer';
      item.style.font = 'inherit';

      const emojiSpan = document.createElement('span');
      emojiSpan.style.fontSize = '20px';
      emojiSpan.textContent = emojiChar;

      const labelSpan = document.createElement('span');
      labelSpan.style.opacity = '0.7';
      labelSpan.textContent = label;

      item.appendChild(emojiSpan);
      item.appendChild(labelSpan);
      item.addEventListener('mouseenter', () => {
        const items = this._getEmojiItems();
        const domIndex = items.indexOf(item);
        this._setActiveEmojiIndex(domIndex);
      });
      item.addEventListener('click', () => this._replaceEmojiAtQuery(emojiChar));
      return item;
    };

    const header = document.createElement('div');
    header.style.padding = '4px 6px';
    header.style.fontSize = '12px';
    header.style.opacity = '0.6';
    header.textContent = this._emojiQuery ? `Emoji: ${this._emojiQuery}` : 'Emoji';
    this._emojiPopupEl.appendChild(header);

    if (!results) {
      const msg = document.createElement('div');
      msg.style.padding = '8px';
      msg.style.opacity = '0.7';
      msg.textContent = 'Type something';
      this._emojiPopupEl.appendChild(msg);
      this._emojiPopupEl.style.display = 'block';
      this._emojiActiveIndex = -1;
      return;
    }

    if (!Array.isArray(results) || results.length === 0) {
      const msg = document.createElement('div');
      msg.style.padding = '8px';
      msg.style.opacity = '0.7';
      msg.textContent = 'No results';
      this._emojiPopupEl.appendChild(msg);
      this._emojiPopupEl.style.display = 'block';
      this._emojiActiveIndex = -1;
      return;
    }

    const limited = results.slice(0, 20);
    limited.forEach((e: Emoji, i: number) => {
      const emojiChar = (e?.skins?.[0]?.native) || e?.native || '';
      const label = e?.id || e?.shortcodes || '';
      if (!emojiChar) return;

      this._emojiPopupEl!.appendChild(makeItem(emojiChar, label, i));
    });

    // initialize active selection to first item
    this._setActiveEmojiIndex(0);

    this._emojiPopupEl.style.display = 'block';
  }

  // Helpers for keyboard navigation in emoji popup
  private _getEmojiItems(): HTMLElement[] {
    return Array.from(this._emojiPopupEl?.querySelectorAll('[data-emoji-item]') ?? []) as HTMLElement[];
  }

  private _getActiveEmojiItem(): HTMLElement | null {
    const items = this._getEmojiItems();
    if (this._emojiActiveIndex < 0 || this._emojiActiveIndex >= items.length) return null;

    return items[this._emojiActiveIndex];
  }

  private _setActiveEmojiIndex(index: number) {
    const items = this._getEmojiItems();
    if (!items.length) {
      this._emojiActiveIndex = -1;
      return;
    }

    if (index < 0) {
      index = items.length - 1;
    }
    if (index >= items.length) {
      index = 0;
    }
    this._emojiActiveIndex = index;

    items.forEach((el, i) => {
      el.setAttribute('aria-selected', String(i === index));
      (el as HTMLElement).style.background = i === index ? 'var(--zn-input-background-color-hover)' : 'transparent';
    });

    const active = items[index];
    if (active && typeof active.scrollIntoView === 'function') {
      active.scrollIntoView({block: 'nearest'});
    }
  }

  private _hideEmojiPopup() {
    this._emojiActive = false;
    this._emojiQuery = '';
    this._emojiActiveIndex = -1;
    if (this._emojiPopupEl) {
      this._emojiPopupEl.style.display = 'none';
      this._emojiPopupEl.innerHTML = '';
    }
  }

  private _replaceEmojiAtQuery(emojiChar: string) {
    try {
      if (!this.quillElement || this._emojiStartIndex < 0) return;

      const sel = this.quillElement.getSelection();
      if (!sel) return;

      const length = sel.index - this._emojiStartIndex;
      if (length < 0) return;

      const insertText = `${emojiChar} `;
      this.quillElement.deleteText(this._emojiStartIndex, length, 'user');
      this.quillElement.insertText(this._emojiStartIndex, insertText, 'user');
      this.quillElement.setSelection(this._emojiStartIndex + insertText.length, 0, 'user');
      this._hideEmojiPopup();
    } catch (e) {
      // no-op
    }
  }

  private _insertDivider() {
    try {
      if (!this.quillElement) return;
      const selection = this.quillElement.getSelection(true);
      let index = selection ? selection.index + selection.length : this.quillElement.getLength();

      const prevChar = index > 0 ? this.quillElement.getText(index - 1, 1) : '\n';
      if (prevChar !== '\n') {
        this.quillElement.insertText(index, '\n', 'user');
        index += 1;
      }

      this.quillElement.insertEmbed(index, 'hr', true, 'user');
      this.quillElement.insertText(index + 1, '\n', 'user');
      this.quillElement.setSelection(index + 1, 0, 'user');

      this._handleTextChange();
    } catch (e) {
      // no-op
    }
  }

  render() {
    return html`
      <zn-editor-toolbar id="toolbar"></zn-editor-toolbar>
      <div id="editor"></div>
      <input type="text" id="editorHtml" name="${this.name}" value="${this.value}" style="display: none;">
      <div id="action-container" class="ql-toolbar ql-snow">
        <slot name="actions"></slot>
      </div>
    `;
  }
}
