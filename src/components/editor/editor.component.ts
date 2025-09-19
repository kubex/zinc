import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {FormControlController} from '../../internal/form';
import {property, query} from 'lit/decorators.js';
import AttachmentModule from "./modules/attachment-module";
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

    Quill.register('modules/dialogModule', DialogModule as any, true);
    Quill.register('modules/menuModule', MenuModule as any, true);
    Quill.register('modules/attachmentModule', AttachmentModule as any, true);
    Quill.register('modules/timeTrackingModule', TimeTrackingModule as any, true);
    Quill.register('modules/dragAndDropModule', DragAndDropModule as any, true);
    Quill.register('modules/imageResizeModule', ImageResizeModule as any, true);

    this._updateIcons();
    const attachmentInput = this.getForm()?.querySelector('input[name="attachments"]');
    const startTimeInput = this.getForm()?.querySelector('input[name="startTime"]');
    const openTimeInput = this.getForm()?.querySelector('input[name="openTime"]');

    /*    const container = [
          ['bold', 'italic', 'underline', 'strike'],
          ['undo', 'redo'],
          [{'list': 'ordered'}, {'list': 'bullet'}],
          ['code-block']
        ];
        container.push(this.interactionType === 'ticket' ? ['link', 'image', 'attachment'] : ['link', 'image', 'video']);
        container.push(['remove-formatting']);*/

    if (this.cannedResponsesUri) {
      await this._fetchCannedResponses();
    }

    const quill = new Quill(this.editor, {
      modules: {
        toolbar: this.toolbar,
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
        imageResizeModule: {}
      },
      placeholder: 'Compose your reply...',
      theme: 'snow',
      bounds: this.editor,
    });

    this.quillElement = quill;

    this._attachToolbarHandlers(quill);
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
    quill.root.addEventListener('click', () => this._syncToolbarState());

    const delta = quill.clipboard.convert({html: this.value});
    quill.setContents(delta, Quill.sources.SILENT);
    // Sync initial toolbar state with current selection/formats
    this._syncToolbarState();

    this.emit('zn-element-added', {detail: {element: this.editor}});
    super.firstUpdated(_changedProperties);
  }

  private _handleTextChange() {
    this.value = this.quillElement.root.innerHTML;
    this.editorHtml.value = this.value;
    this.emit('zn-change');
    // Keep toolbar state in sync after text changes
    this._syncToolbarState();
  }

  private _updateIcons() {
    // @ts-expect-error icons has no type
    const icons: { [key: string]: string } = Quill.import("ui/icons");
    if (icons) {
      icons["undo"] = `<zn-icon src="undo" size="20"></zn-icon>`;
      icons["redo"] = `<zn-icon src="redo" size="20"></zn-icon>`;
      icons["remove-formatting"] = `<zn-icon src="format_clear" size="20"></zn-icon>`;

      if (this.interactionType === 'ticket') {
        icons["attachment"] = `<zn-icon src="attachment" size="20"></zn-icon>`;
      }
    }
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

    if (this.interactionType === 'chat') {
      // @ts-expect-error bindings has no type
      bindings['enter'] = {
        key: 'Enter',
        shiftKey: false,
        handler: () => {
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
            }
          }
        },
      };
    }

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
      item.checked = wantedValues.includes(value);
    });
  }

  private _updateDropdownTriggerLabel(dropdownSelector: string, defaultLabel: string) {
    const toolbarShadowRoot = this.toolbar.shadowRoot;
    const dropdown = toolbarShadowRoot?.querySelector(dropdownSelector) as HTMLElement | null;
    if (!dropdown) return;

    const trigger = dropdown.querySelector('zn-button[slot="trigger"]') as HTMLElement | null;
    if (!trigger) return;

    const menu = dropdown.querySelector('zn-menu');
    const items = menu?.querySelectorAll('zn-menu-item') as NodeListOf<ZnMenuItem> | undefined;

    let label = defaultLabel;
    if (items?.length) {
      items.forEach((item: ZnMenuItem) => {
        const checked = item.checked ?? (item.hasAttribute('checked'));
        if (checked) {
          label = item.getAttribute('data-text') ?? item.textContent?.trim() ?? defaultLabel;
        }
      });
    }

    trigger.textContent = label;
  }

  private _updateDropdownTriggerIcon(dropdownSelector: string, defaultIconSrc: string) {
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

    this._updateDropdownTriggerLabel('zn-dropdown.header__dropdown', 'Normal Text');
    this._updateDropdownTriggerIcon('zn-dropdown.list__dropdown', 'lists');
  }

  private _updateHeadingFormatMenu(formats: Record<string, any>) {
    const wanted = formats.header ? String(formats.header) : ''; // Empty string for text normal
    this._updateMenuCheckedState('zn-dropdown.header__dropdown zn-menu zn-menu-item[data-format]', 'data-format-type', wanted);
  }

  private _updateListFormatMenu(formats: Record<string, any>) {
    const list = formats.list as string | null;
    const listValue = (list === 'ordered' || list === 'bullet' || list === 'checked') ? list : null;
    this._updateMenuCheckedState('zn-dropdown.list__dropdown zn-menu zn-menu-item[data-format]', 'data-format-type', listValue);
  }

  private _updateTextFormatMenu(formats: Record<string, any>) {
    const selector = 'zn-dropdown.format__dropdown zn-menu zn-menu-item[data-format]';
    const attr = 'data-format';
    const wanted = this._getTextFormats(formats);

    this._updateMenuCheckedState(selector, attr, wanted);
  }

  private _getTextFormats(formats: Record<string, any>) {
    const wanted: string[] = [];
    if (formats.strike) {
      wanted.push('strike');
    }
    if (formats.blockquote) {
      wanted.push('blockquote');
    }
    if (Object.prototype.hasOwnProperty.call(formats, 'code-block')) {
      wanted.push('code-block');
    }
    return wanted;
  }

  private _attachToolbarHandlers(quill: Quill) {
    const toolbarModule = quill.getModule('toolbar') as Toolbar | undefined;
    if (!toolbarModule) return;

    const callFormat = (key: string, value?: any) => {
      const handler = (toolbarModule.handlers?.[key] as ((value?: any) => void) | undefined);
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
      if (key === 'header' && value === undefined) {
        value = false; // False for text normal
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

          const type = target.getAttribute('data-format-type');
          callFormat(format, type ?? undefined);
        });
      });
    }
  }

  private _syncButtonState(icon: string, active: boolean) {
    const el = this.toolbar.shadowRoot?.querySelector(`zn-button[icon="${icon}"]`) as HTMLElement | null;
    if (!el) return;
    if (active) {
      el.setAttribute('icon-color', 'primary');
    } else {
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
