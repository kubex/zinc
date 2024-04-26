import {html, unsafeCSS} from "lit";
import {customElement, property, query} from 'lit/decorators.js';
import Quill from 'quill';
import DropdownModule from "./dropdown-module";

import {PropertyValues} from "@lit/reactive-element";
import {ZincElement, ZincFormControl} from "../zinc-element";
import {FormControlController} from "../form";

import styles from './index.scss';

@customElement('zn-editor')
export class Editor extends ZincElement implements ZincFormControl
{
  static styles = unsafeCSS(styles);

  private formControlController = new FormControlController(this, {});

  @query('#editor')
  private editor: HTMLElement;

  @query('#editorHtml')
  private editorHtml: HTMLTextAreaElement;

  @query('#toolbar-container')
  private toolbarContainer: HTMLElement;

  @property({reflect: true}) name: string;
  @property({reflect: true}) value: string;

  @property({attribute: 'canned-responses', type: Array})
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
      enter: {
        key: 'Enter',
        shiftKey: false,
        handler: (range, context) =>
        {
          const form = this.closest('form');
          if(form)
          {
            this.emit('zn-submit', {detail: {value: this.value, element: this}});
            form.requestSubmit();
            this.quillElement.setText('');
          }
        }
      },
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

    Quill.register('modules/dropdownModule', DropdownModule as any);

    const icons = Quill.import("ui/icons");
    icons["undo"] = html`
      <svg viewbox="0 0 18 18">
        <polygon class="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10"></polygon>
        <path class="ql-stroke" d="M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9"></path>
      </svg>`;
    icons["redo"] = html`
      <svg viewbox="0 0 18 18">
        <polygon class="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10"></polygon>
        <path class="ql-stroke" d="M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5"></path>
      </svg>`;
    icons["remove-formatting"] = html`
      <svg viewbox="0 0 18 18">
        <rect class="ql-stroke" height="12" width="12" x="3" y="3"></rect>
        <line class="ql-stroke" x1="3" x2="15" y1="3" y2="15"></line>
        <line class="ql-stroke" x1="3" x2="15" y1="15" y2="3"></line>
      </svg>`;

    const quill = new Quill(this.editor, {
      modules: {
        toolbar: {
          container: [
            /* [{'header': [1, 2, 3, 4, 5, 6, false]}], */
            ['bold', 'italic', 'underline', 'strike'],
            ['undo', 'redo'],
            [{'list': 'ordered'}, {'list': 'bullet'}/* , {'list': 'check'} */],
            ['link', 'image', 'video'],
            ['remove-formatting'],
          ],
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
  }


  _handleSelectionChange()
  {
    this.quillElement.selection.update();
  }

  _handleTextChange()
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
