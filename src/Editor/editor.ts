import { html, LitElement, unsafeCSS } from "lit";
import { customElement, property, query } from 'lit/decorators.js';
import Quill from 'quill';
import DropdownModule from "./dropdown-module";

import styles from './index.scss';
import { PropertyValues } from "@lit/reactive-element";

@customElement('zn-editor')
export class Editor extends LitElement
{
  static styles = unsafeCSS(styles);

  @query('#editor')
  private editor: HTMLElement;

  @query('#editorHtml')
  private editorHtml: HTMLTextAreaElement;

  @query('#toolbar-container')
  private toolbarContainer: HTMLElement;

  @property({ attribute: 'name', type: String, reflect: true })
  public name: string;

  @property({ attribute: 'value', type: String, reflect: true })
  public value: string;

  @property({ attribute: 'canned-responses', type: Array })
  public cannedResponses: Array<any>;

  private internals: ElementInternals;
  private quillElement: Quill;

  constructor()
  {
    super();
    this.internals = this.attachInternals();
  }

  _updateInternals()
  {
    this.internals.setFormValue(this.value);
    this.internals.setValidity({});
  }

  static get formAssociated()
  {
    return true;
  }

  protected firstUpdated(_changedProperties: PropertyValues)
  {
    const bindings = {
      enter: {
        key: 'Enter',
        shiftKey: true,
        handler: (range, context) =>
        {
          const form = this.closest('form');
          if(form)
          {
            form.requestSubmit();
            // clear contents
            this.quillElement.setText('');
          }
        }
      },
      // clear formatting on paste
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

    Quill.register('modules/dropdownModule', DropdownModule as any);

    const icons = Quill.import("ui/icons");
    icons["undo"] = `<svg viewbox="0 0 18 18">
    <polygon class="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10"></polygon>
    <path class="ql-stroke" d="M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9"></path>
  </svg>`;
    icons["redo"] = `<svg viewbox="0 0 18 18">
    <polygon class="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10"></polygon>
    <path class="ql-stroke" d="M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5"></path>
  </svg>`;
    icons["remove-formatting"] = `<svg viewbox="0 0 18 18">
    <rect class="ql-stroke" height="12" width="12" x="3" y="3"></rect>
    <line class="ql-stroke" x1="3" x2="15" y1="3" y2="15"></line>
    <line class="ql-stroke" x1="3" x2="15" y1="15" y2="3"></line>
  </svg>`;

    const quill = new Quill(this.editor, {
      modules: {
        toolbar: {
          container: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['undo', 'redo'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
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
      placeholder: 'Compose an epic...',
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
      this._updateInternals();
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

    document.addEventListener('selectionchange', (...args) =>
    {
      quill.selection.update();
    });

    quill.on('text-change', () =>
    {
      this.value = quill.root.innerHTML;
      this._updateInternals();
    });
  }

  render()
  {
    return html`
      <div id="editor"></div>
      <div id="action-container" class="ql-toolbar ql-snow">
        <slot name="actions"></slot>
      </div>
    `;
  }
}
