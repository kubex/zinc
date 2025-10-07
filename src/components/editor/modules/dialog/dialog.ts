import {html} from "lit";
import {litToHTML} from "../../../../utilities/lit-to-html";
import type DialogComponent from "./dialog.component";
import type Quill from "quill";

class Dialog {
  private readonly _quill: Quill;
  private readonly _editorId: string;
  private readonly _document: Document;
  private _component!: DialogComponent;

  constructor(quill: Quill, options: { editorId: string }) {
    this._quill = quill;
    this._editorId = options.editorId;
    this._document = this._quill.container.ownerDocument;
    this._initDialog();
  }

  private _initDialog() {
    const existing = this._document.querySelector<DialogComponent>('zn-editor-dialog');
    if (existing) {
      this._component = existing;
    } else {
      this._component = this.createComponent()!;
      this._document.body.appendChild(this._component);
    }

    this._component.editorId = this._editorId;
  }

  private createComponent() {
    const tpl = html`
      <zn-editor-dialog></zn-editor-dialog>`;
    return litToHTML<DialogComponent>(tpl);
  }

  public close() {
    this._component.dialogEl.close();
  }
}

export default Dialog;
