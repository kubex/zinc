import { html, unsafeCSS } from "lit";
import { customElement, property, query } from 'lit/decorators.js';
import Quill from 'quill';
import DropdownModule, { dropdownOpen } from "./dropdown-module";
import AttachmentModule from "./AttachmentHandler/attachment-module";

import { PropertyValues } from "@lit/reactive-element";
import { ZincElement, ZincFormControl } from "@/zinc-element";
import { FormControlController } from "@/form";

import styles from './index.scss?inline';

@customElement('zn-editor')
export class Editor extends ZincElement implements ZincFormControl
{
  static styles = unsafeCSS(styles);

  private formControlController = new FormControlController(this, {});

  @query('#editor')
  private editor: HTMLElement;

  @query('#editorHtml')
  private editorHtml: HTMLTextAreaElement;

  @property({ reflect: true }) name: string;
  @property({ reflect: true }) value: string;

  @property({ attribute: 'interaction-type', type: String })
  public interactionType: 'ticket' | 'chat';

  @property({ attribute: 'canned-responses', type: Array })
  public cannedResponses: Array<any>;

  private quillElement: Quill;

  get validity(): ValidityState
  {
    return this.editorHtml.validity;
  }

  get validationMessage(): string
  {
    return this.editorHtml.validationMessage;
  }

  checkValidity(): boolean
  {
    return this.editorHtml.checkValidity();
  }

  getForm(): HTMLFormElement | null
  {
    return this.formControlController.getForm();
  }

  reportValidity(): boolean
  {
    return this.editorHtml.reportValidity();
  }

  setCustomValidity(message: string): void
  {
    this.editorHtml.setCustomValidity(message);
    this.formControlController.updateValidity();
  }

  protected firstUpdated(_changedProperties: PropertyValues)
  {
    this.formControlController.updateValidity();

    const bindings = {
      'remove-formatting': {
        key: 'V',
        shiftKey: true,
        handler: (range, context) =>
        {
          const clipboard = context.event.clipboardData;
          const text = clipboard.getData('text/plain');
          const html = clipboard.getData('text/html');
          const delta = this.quillElement.clipboard.convert({ html: html, text: text });
          this.quillElement.setContents(delta, 'silent');
          this.quillElement.setSelection(delta.length(), Quill.sources.SILENT);
        }
      }
    };

    if(this.interactionType === 'chat')
    {
      bindings['enter'] = {
        key: 'Enter',
        shiftKey: false,
        handler: () =>
        {
          const form = this.closest('form');
          if(form && !dropdownOpen && this.value.trim().length > 0)
          {
            this.emit('zn-submit', { detail: { value: this.value, element: this } });
            form.requestSubmit();
            this.quillElement.setText('');
          }
        },
      };
    }

    Quill.register('modules/dropdownModule', DropdownModule as any);
    Quill.register('modules/attachmentModule', AttachmentModule as any);

    const icons = Quill.import("ui/icons");
    icons["undo"] = `
      <svg viewbox="0 0 18 18">
        <polygon class="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10"></polygon>
        <path class="ql-stroke" d="M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9"></path>
      </svg>`;
    icons["redo"] = `
      <svg viewbox="0 0 18 18">
        <polygon class="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10"></polygon>
        <path class="ql-stroke" d="M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5"></path>
      </svg>`;
    icons["remove-formatting"] = `
      <svg viewbox="0 0 18 18">
        <rect class="ql-stroke" height="12" width="12" x="3" y="3"></rect>
        <line class="ql-stroke" x1="3" x2="15" y1="3" y2="15"></line>
        <line class="ql-stroke" x1="3" x2="15" y1="15" y2="3"></line>
      </svg>`;

    if(this.interactionType === 'ticket')
    {
      // change image icon to a paperclip
      icons["image"] = `
      <svg viewBox="0 0 30.34 30.34">
        <path d="M22.562 12.491s1.227-.933.293-1.866c-.934-.933-1.842.271-1.842.271l-9.389 9.391s-2.199 2.838-3.871 1.122c-1.67-1.718 1.121-3.872 1.121-3.872l12.311-12.31s2.873-3.165 5.574-.466c2.697 2.7-.477 5.579-.477 5.579L12.449 24.173s-4.426 5.113-8.523 1.015 1.066-8.474 1.066-8.474L15.494 6.209s1.176-.982.295-1.866c-.885-.883-1.865.295-1.865.295L1.873 16.689s-4.549 4.989.531 10.068c5.08 5.082 10.072.533 10.072.533l16.563-16.565s3.314-3.655-.637-7.608-7.607-.639-7.607-.639L6.543 16.728s-3.65 2.969-.338 6.279c3.312 3.314 6.227-.39 6.227-.39l10.13-10.126z"/>
      </svg>`;
    }

    const attachmentInput = this.getForm().querySelector('input[name="attachments"]');

    const container = [
      ['bold', 'italic', 'underline', 'strike'],
      ['undo', 'redo'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ];
    if(this.interactionType === 'ticket')
    {
      container.push(['link', 'image']);
    }
    else
    {
      container.push(['link', 'image', 'video']);
    }

    container.push(['remove-formatting']);

    const quill = new Quill(this.editor, {
      modules: {
        toolbar: {
          container,
          handlers: {
            'redo': () =>
            {
              this.quillElement.history.redo();
            },
            'undo': () =>
            {
              this.quillElement.history.undo();
            },
            'remove-formatting': () =>
            {
              const range = this.quillElement.getSelection();
              this.quillElement.formatText(range.index, range.length, 'bold', false);
              this.quillElement.formatText(range.index, range.length, 'italic', false);
              this.quillElement.formatText(range.index, range.length, 'underline', false);
              this.quillElement.formatText(range.index, range.length, 'strike', false);
            }
          }
        },
        keyboard: {
          bindings: bindings
        },
        dropdownModule: {
          cannedResponses: this.cannedResponses
        },
        attachmentModule: {
          attachmentInput: attachmentInput,
          onFileUploaded: (node, { url }) =>
          {
            console.log('file uploaded', node, url);
            window.onbeforeunload = () => null;
          },
          upload: file =>
          {
            window.onbeforeunload = () => 'You have unsaved changes. Are you sure you want to leave?';
            return new Promise((resolve, reject) =>
            {
              setTimeout(() =>
              {
                resolve('https://chargehive.com/_r/r/6162bf27e7a5/img/chargie.svg');
              }, 100);

              // const fd = new FormData();
              // fd.append('upload_file', file);
              // const xhr = new XMLHttpRequest();
              // xhr.open('POST', '/upload', true);
              // xhr.onload = () => {
              //   if (xhr.status === 200) {
              //     const response = JSON.parse(xhr.responseText);
              //     resolve(response.file_path); // must resolve as a link to the file
              //   }
              // };
              // xhr.send(fd);
            });
          }
        }
      },
      placeholder: 'Compose your reply...',
      theme: 'snow',
      bounds: this.editor,
    });

    this.quillElement = quill;

    const normalizeNative = (nativeRange: any) =>
    {
      if(nativeRange)
      {
        const range = nativeRange;
        if(range.baseNode)
        {
          range.startContainer = nativeRange.baseNode;
          range.endContainer = nativeRange.focusNode;
          range.startOffset = nativeRange.baseOffset;
          range.endOffset = nativeRange.focusOffset;

          if(range.endOffset < range.startOffset)
          {
            range.startContainer = nativeRange.focusNode;
            range.endContainer = nativeRange.baseNode;
            range.startOffset = nativeRange.focusOffset;
            range.endOffset = nativeRange.baseOffset;
          }
        }

        if(range.startContainer)
        {
          return {
            start: { node: range.startContainer, offset: range.startOffset },
            end: { node: range.endContainer, offset: range.endOffset },
            native: range
          };
        }
      }

      super.firstUpdated(_changedProperties);
      return null;
    };

    quill.selection.hasFocus = function ()
    {
      const rootNode = quill.root.getRootNode() as Document;
      return rootNode.activeElement === quill.root;
    };

    quill.selection.getNativeRange = () =>
    {
      const dom = quill.root.getRootNode() as Document;
      const selection = dom.getSelection();
      return normalizeNative(selection);
    };

    this.emit('zn-element-added', { detail: { element: this.editor } });

    document.addEventListener('selectionchange', this._handleSelectionChange.bind(this));
    quill.on('text-change', this._handleTextChange.bind(this));
  }


  private _handleSelectionChange()
  {
    this.quillElement.selection.update();
  }

  private _handleTextChange()
  {
    this.value = this.quillElement.root.innerHTML;
    this.emit('zn-change');
  }

  render()
  {
    return html`
      <div id="editor"></div>
      <input type="text" id="editorHtml" name="${this.name}" value="${this.value}" style="display: none;">
      <div id="action-container" class="ql-toolbar ql-snow">
        <slot name="actions"></slot>
      </div>
    `;
  }
}
