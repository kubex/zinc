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
    this._component = this.createComponent()!;
    this._mountPoint().appendChild(this._component);
    this._component.editorId = this._editorId;
  }

  public get component(): DialogComponent {
    return this._component;
  }

  private _mountPoint(): HTMLElement {
    const root = this._quill.container.getRootNode();
    const host = root instanceof ShadowRoot ? (root.host as HTMLElement) : null;
    return host?.parentElement ?? this._document.body;
  }

  private createComponent() {
    const tpl = html`
      <zn-editor-dialog></zn-editor-dialog>`;
    return litToHTML<DialogComponent>(tpl);
  }

  public isOpen() {
    return this._component.dialogEl.open;
  }

  public close() {
    this._component.dialogEl.close();
  }
}

export default Dialog;
