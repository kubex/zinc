import {html, unsafeCSS} from "lit";
import {customElement, property, query} from 'lit/decorators.js';
import Quill from 'quill';
import DropdownModule, {dropdownOpen} from "./dropdown-module";
import AttachmentModule from "./AttachmentHandler/attachment-module";

import {PropertyValues} from "@lit/reactive-element";
import {ZincElement, ZincFormControl} from "@/zinc-element";
import {FormControlController} from "@/form";

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

  @property() name: string;
  @property() value: string;

  @property({attribute: 'interaction-type', type: String})
  interactionType: 'ticket' | 'chat' = 'chat';

  @property({attribute: 'canned-responses', type: Array})
  cannedResponses: Array<any>;

  @property({attribute: 'canned-responses-url'}) cannedResponsesUri: string;

  @property({attribute: 'attachment-url', type: String})
  uploadAttachmentUrl: string;

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
          const delta = this.quillElement.clipboard.convert({html: html, text: text});
          this.quillElement.setContents(delta, 'silent');
          this.quillElement.setSelection(delta.length(), Quill.sources.SILENT);
        }
      }
    };

    const empty = (value: string) =>
    {
      const match = value.match(/[^<pbr\s>\/]/);
      return match === null;
    };

    if(this.interactionType === 'chat')
    {
      bindings['enter'] = {
        key: 'Enter',
        shiftKey: false,
        handler: () =>
        {
          const form = this.closest('form');
          if(form && !dropdownOpen && this.value && this.value.trim().length > 0 && !empty(this.value))
          {
            this.emit('zn-submit', {detail: {value: this.value, element: this}});
            form.requestSubmit();
            this.quillElement.setText('');
          }
        },
      };
    }

    Quill.debug('error');
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
      <svg viewBox="0 0 395.449 395.449">
          <path d="m357.744 60.411-.033-.032c-24.096-24.096-59.338-39.665-89.789-39.666-32.213 0-62.475 12.52-85.213 35.255L28.16 210.517C10.004 228.673.004 252.832 0 278.551c.002 25.71 9.996 49.863 28.146 68.015l.014.015c18.154 18.149 42.313 28.149 68.029 28.156.018 0 .037-.002.055 0 25.701-.012 49.846-10.012 67.988-28.158l137.25-137.243c4.803-4.756 20.479-22.251 20.545-47.657.03-11.833-3.388-29.394-19.849-45.855-18.477-18.477-37.973-21.26-51.075-20.341-15.914 1.116-31.23 8.282-43.128 20.18L96.251 227.384c-7.811 7.812-7.811 20.474 0 28.284 7.811 7.81 20.473 7.811 28.285 0l111.726-111.727c5.006-5.005 11.437-8.125 17.642-8.562 6.987-.49 13.715 2.445 19.991 8.724 5.412 5.412 8.15 11.288 8.134 17.467-.025 10.242-7.244 17.907-8.759 19.408L135.945 318.295c-10.588 10.591-24.682 16.429-39.695 16.439-.035-.002-.07 0-.105-.002-15.014-.016-29.111-5.854-39.705-16.443l-.008-.008C45.836 307.686 40 293.574 40 278.553c.002-15.031 5.842-29.147 16.445-39.752l154.549-154.55c15.18-15.179 35.397-23.539 56.928-23.539 19.76 0 45.047 11.493 61.512 27.956l.021.021c16.033 16.035 25.994 38.852 25.994 59.549 0 21.53-8.357 41.747-23.539 56.926l-53.988 53.979c-7.812 7.812-7.813 20.474-.002 28.284l.002.002c7.81 7.811 20.471 7.812 28.279.001l53.992-53.981c22.735-22.734 35.256-52.997 35.256-85.211 0-31.388-14.095-64.218-37.705-87.827z"/>
      </svg>`;
    }

    const attachmentInput = this.getForm().querySelector('input[name="attachments"]');

    const container = [
      ['bold', 'italic', 'underline', 'strike'],
      ['undo', 'redo'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
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

    console.log('canned-responses', this.cannedResponses);

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
          cannedResponses: this.cannedResponses,
          cannedResponsesUri: this.cannedResponsesUri
        },
        attachmentModule: {
          attachmentInput: attachmentInput,
          onFileUploaded: (node, {url}) =>
          {
            window.onbeforeunload = () => null;
          },
          upload: (file: File) =>
          {
            window.onbeforeunload = () => 'You have unsaved changes. Are you sure you want to leave?';
            return new Promise((resolve, reject) =>
            {
              const fd = new FormData();
              fd.append('filename', file.name);
              fd.append('size', file.size.toString());
              fd.append('mimeType', file.type);

              const xhr = new XMLHttpRequest();
              xhr.open('POST', this.uploadAttachmentUrl, true);
              xhr.onload = () =>
              {
                if(xhr.status === 200)
                {
                  const response = JSON.parse(xhr.responseText);
                  resolve({path: response.uploadPath, url: response.uploadUrl, filename: response.originalFilename});
                }
              };
              xhr.send(fd);
            });
          },
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
            start: {node: range.startContainer, offset: range.startOffset},
            end: {node: range.endContainer, offset: range.endOffset},
            native: range
          };
        }
      }

      super.firstUpdated(_changedProperties);
      return null;
    };

    const html = quill.clipboard.convert({html: this.value});
    quill.setContents(html, Quill.sources.SILENT);

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

    this.emit('zn-element-added', {detail: {element: this.editor}});

    document.addEventListener('selectionchange', this._handleSelectionChange.bind(this));
    quill.on('text-change', this._handleTextChange.bind(this));

    const toolbar = quill.container.previousSibling as HTMLElement;
    toolbar.querySelector('button.ql-bold').setAttribute('title', 'Bold');
    toolbar.querySelector('button.ql-italic').setAttribute('title', 'Italic');
    toolbar.querySelector('button.ql-underline').setAttribute('title', 'Underline');
    toolbar.querySelector('button.ql-strike').setAttribute('title', 'Strikethrough');
    toolbar.querySelector('button.ql-undo').setAttribute('title', 'Undo');
    toolbar.querySelector('button.ql-redo').setAttribute('title', 'Redo');
    toolbar.querySelector('button.ql-redo').setAttribute('title', 'Redo');
    toolbar.querySelector('button.ql-list[value="ordered"]').setAttribute('title', 'Ordered List');
    toolbar.querySelector('button.ql-list[value="bullet"]').setAttribute('title', 'Bullet List');
    toolbar.querySelector('button.ql-link').setAttribute('title', 'Link');
    toolbar.querySelector('button.ql-image').setAttribute('title', 'Image');
    toolbar.querySelector('button.ql-remove-formatting').setAttribute('title', 'Remove Formatting');
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
