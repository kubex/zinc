import { html, LitElement, unsafeCSS } from "lit";
import { customElement, property, query } from 'lit/decorators.js';
import Quill from 'quill';

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

  private internals: ElementInternals;

  constructor()
  {
    super();
    this.internals = this.attachInternals();
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
        handler: (range, context) =>
        {
          const form = this.closest('form');
          if(form)
          {
            form.requestSubmit();
          }
        }
      }
    };

    const quill = new Quill(this.editor, {
      modules: {
        toolbar: this.toolbarContainer,
        keyboard: {
          bindings: bindings
        }
      },
      placeholder: 'Compose an epic...',
      theme: 'snow',
      bounds: this.editor,
    });

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
      <div id="toolbar-container">
        <div class="wrap">
          <button class="ql-bold"></button>
          <button class="ql-italic"></button>
          <button class="ql-underline"></button>
        </div>
      </div>
      <div id="editor"></div>
      <div id="action-container" class="ql-toolbar ql-snow">
        <slot name="actions"></slot>
      </div>
    `;
  }

  _updateInternals()
  {
    this.internals.setFormValue(this.value);
    this.internals.setValidity({});
  }
}


