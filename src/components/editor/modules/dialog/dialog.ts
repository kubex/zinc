import {html} from "lit";
import {litToHTML} from "../../../../utilities/lit-to-html";
import type DialogComponent from "./dialog.component";
import type Quill from "quill";

class Dialog {
  private readonly _quill: Quill;
  private readonly _editorId: string;
  private _component!: DialogComponent;

  constructor(quill: Quill, options: {editorId: string}) {
    this._quill = quill;
    this._editorId = options.editorId;
    this._initDialog();
  }

  private _initDialog() {
    this._component = this.createComponent()!;
    this._component.editorId = this._editorId;
    this._quill.container.ownerDocument.body.appendChild(this._component);
  }

  private createComponent() {
    const tpl = html`
      <zn-editor-dialog></zn-editor-dialog>`;
    return litToHTML<DialogComponent>(tpl);
  }
}

export default Dialog;
