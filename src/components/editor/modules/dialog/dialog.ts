import {html} from "lit";
import {litToHTML} from "../../../../utilities/lit-to-html";
import type {EditorHost} from '../host';
import type DialogComponent from "./dialog.component";

class Dialog {
  private readonly _container: HTMLElement;
  private readonly _editorId: string;
  private readonly _document: Document;
  private _component!: DialogComponent;

  constructor(host: EditorHost, options: { editorId: string }) {
    this._container = host.container;
    this._editorId = options.editorId;
    this._document = this._container.ownerDocument;
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
    const root = this._container.getRootNode();
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
