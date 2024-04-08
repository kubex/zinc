import { html, LitElement, unsafeCSS } from "lit";
import { customElement, query } from 'lit/decorators.js';
import Quill from 'quill';

import styles from './index.scss';
import { PropertyValues } from "@lit/reactive-element";

@customElement('zn-editor')
export class Editor extends LitElement
{
  static styles = unsafeCSS(styles);

  @query('#editor')
  private editor: HTMLElement;

  protected firstUpdated(_changedProperties: PropertyValues)
  {
    const quill = new Quill(this.editor, {
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline']
        ]
      },
      placeholder: 'Compose an epic...',
      theme: 'snow',
      bounds: this.editor
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

      return null;
    };

    quill.selection.getNativeRange = () =>
    {
      const dom = quill.root.getRootNode() as Document;
      const selection = dom.getSelection();
      const range = normalizeNative(selection);

      return range;
    };

    document.addEventListener('selectionchange', (...args) =>
    {
      quill.selection.update();
    });

  }

  render()
  {
    return html`
      <div id="editor">
        <p></p>
      </div>
    `;
  }
}


