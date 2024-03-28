import { html, LitElement, unsafeCSS } from "lit";
import { customElement } from 'lit/decorators.js';
import Quill from 'quill';

import styles from './index.scss';
import { PropertyValues } from "@lit/reactive-element";

@customElement('zn-editor')
export class Editor extends LitElement
{
  static styles = unsafeCSS(styles);

  protected firstUpdated(_changedProperties: PropertyValues)
  {
    const selector = this.shadowRoot.querySelector('#editor') as HTMLElement;
    const quill = new Quill(selector, {
      modules: {
        toolbar: [
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline'],
          ['image', 'code-block', 'video']
        ]
      },
      placeholder: 'Compose an epic...',
      theme: 'snow'  // or 'bubble'
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
      return normalizeNative(selection);
    };

    document.addEventListener('selectionchange', (...args) =>
    {
      quill.selection.update();
    });

  }

  render()
  {
    return html`
      <textarea name="content" id="editor">
        This is the content within the text area
      </textarea>
    `;
  }
}


