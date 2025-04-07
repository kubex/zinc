import {property, query} from 'lit/decorators.js';
import {type CSSResultGroup, html, PropertyValues, unsafeCSS} from 'lit';
import ZincElement, {ZincFormControl} from '../../internal/zinc-element';
import Quill from "quill";
import {FormControlController} from '../../internal/form';
import DropdownModule, {dropdownOpen} from "./modules/dropdown-module/dropdown-module";
import AttachmentModule from "./modules/attachment-module";
import TimeTrackingModule from "./modules/time-tracking-module";
import DragAndDropModule from "./modules/drag-drop-module";
import ImageResizeModule from "./modules/image-resize-module/image-resize-module";
import {normalizeNative} from "./normalize-native";

import styles from './editor.scss';

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

  protected firstUpdated(_changedProperties: PropertyValues) {
    this.formControlController.updateValidity();

    const bindings = this._getQuillKeyboardBindings();

    Quill.debug('error');
    Quill.register('modules/dropdownModule', DropdownModule as any);
    Quill.register('modules/attachmentModule', AttachmentModule as any);
    Quill.register('modules/timeTrackingModule', TimeTrackingModule as any);
    Quill.register('modules/dragAndDropModule', DragAndDropModule as any);
    Quill.register('modules/imageResizeModule', ImageResizeModule as any);

    this._updateIcons();
    const attachmentInput = this.getForm()?.querySelector('input[name="attachments"]');
    const startTimeInput = this.getForm()?.querySelector('input[name="startTime"]');
    const openTimeInput = this.getForm()?.querySelector('input[name="openTime"]');

    const container = [
      ['bold', 'italic', 'underline', 'strike'],
      ['undo', 'redo'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
    ];
    container.push(this.interactionType === 'ticket' ? ['link', 'image', 'image-attachment'] : ['link', 'image', 'video']);
    container.push(['remove-formatting']);

    const quill = new Quill(this.editor, {
      modules: {
        toolbar: {
          container,
          handlers: {
            'placeholder': function (value: any) {
              if (value) {
                const cursorPosition = this.quill.getSelection().index;
                this.quill.insertText(cursorPosition, value);
                this.quill.setSelection(cursorPosition + value.length);
              }
            },
            'redo': () => this.quillElement.history.redo(),
            'undo': () => this.quillElement.history.undo(),
            'remove-formatting': () => {
              const range = this.quillElement.getSelection();
              if (range) {
                this.quillElement.formatText(range.index, range.length, 'bold', false);
                this.quillElement.formatText(range.index, range.length, 'italic', false);
                this.quillElement.formatText(range.index, range.length, 'underline', false);
                this.quillElement.formatText(range.index, range.length, 'strike', false);
              }

            }
          }
        },
        keyboard: {
          bindings: bindings
        },
        dropdownModule: {
          cannedResponses: this.cannedResponses,
          cannedResponsesUri: this.cannedResponsesUri
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

    this._supplyPlaceholderDropdown();

    quill.selection.hasFocus = function () {
      const rootNode = quill.root.getRootNode() as Document;
      return rootNode.activeElement === quill.root;
    };

    quill.selection.getNativeRange = () => {
      const dom = quill.root.getRootNode() as Document;
      const selection = dom.getSelection();
      return normalizeNative(selection);
    };

    document.addEventListener('selectionchange', () => this.quillElement.selection.update());
    quill.on('text-change', this._handleTextChange.bind(this));

    this._setupTitleAttributes(quill);

    const html = quill.clipboard.convert({html: this.value});
    quill.setContents(html, Quill.sources.SILENT);

    this.emit('zn-element-added', {detail: {element: this.editor}});

    super.firstUpdated(_changedProperties);
  }

  private _handleTextChange() {
    this.value = this.quillElement.root.innerHTML;
    this.emit('zn-change');
  }

  private _updateIcons() {
    const icons = Quill.import("ui/icons");
    if (icons) {
      // @ts-ignore
      icons["undo"] = `<zn-icon src="undo" size="20"></zn-icon>`;
      // @ts-ignore
      icons["redo"] = `<zn-icon src="redo" size="20"></zn-icon>`;
      // @ts-ignore
      icons["remove-formatting"] = `<zn-icon src="format_clear" size="20"></zn-icon>`;

      if (this.interactionType === 'ticket') {
        // @ts-ignore
        icons["image-attachment"] = `<zn-icon src="attachment" size="20"></zn-icon>`;
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
      // @ts-ignore
      bindings['enter'] = {
        key: 'Enter',
        shiftKey: false,
        handler: () => {
          const form = this.closest('form');
          if (form && !dropdownOpen && this.value && this.value.trim().length > 0 && !empty(this.value)) {
            this.emit('zn-submit', {detail: {value: this.value, element: this}});
            form.requestSubmit();
            this.quillElement.setText('');
          }
        },
      };
    }

    return bindings;
  }

  private _supplyPlaceholderDropdown() {
    const placeholderItems: Array<HTMLElement> = Array.prototype.slice.call(this.shadowRoot?.querySelectorAll('.ql-placeholder .ql-picker-item'));
    placeholderItems.forEach((item) => item.textContent = item.dataset.value ?? '');
    placeholderItems.forEach((item) => item.classList.remove('ql-selected'));
  }

  private _setupTitleAttributes(quill: Quill) {
    const toolbar = quill.container.previousSibling as HTMLElement;
    if (toolbar) {
      toolbar.querySelector('button.ql-bold')?.setAttribute('title', 'Bold');
      toolbar.querySelector('button.ql-italic')?.setAttribute('title', 'Italic');
      toolbar.querySelector('button.ql-underline')?.setAttribute('title', 'Underline');
      toolbar.querySelector('button.ql-strike')?.setAttribute('title', 'Strikethrough');
      toolbar.querySelector('button.ql-undo')?.setAttribute('title', 'Undo');
      toolbar.querySelector('button.ql-redo')?.setAttribute('title', 'Redo');
      toolbar.querySelector('button.ql-redo')?.setAttribute('title', 'Redo');
      toolbar.querySelector('button.ql-list[value="ordered"]')?.setAttribute('title', 'Ordered List');
      toolbar.querySelector('button.ql-list[value="bullet"]')?.setAttribute('title', 'Bullet List');
      toolbar.querySelector('button.ql-link')?.setAttribute('title', 'Link');
      toolbar.querySelector('button.ql-image')?.setAttribute('title', 'Image');
      toolbar.querySelector('button.ql-remove-formatting')?.setAttribute('title', 'Remove Formatting');
    }
  }

  render() {
    return html`
      <div id="editor"></div>
      <input type="text" id="editorHtml" name="${this.name}" value="${this.value}" style="display: none;">
      <div id="action-container" class="ql-toolbar ql-snow">
        <slot name="actions"></slot>
      </div>
    `;
  }
}
