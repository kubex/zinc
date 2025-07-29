import './dialog-module.component';
import {html} from "lit";
import {litToHTML} from "../../../../utilities/lit-to-html";
import type {CannedResponse} from "../../editor.component";
import type {ZnCommandSelectEvent} from "../events/zn-command-select";
import type Quill from 'quill';
import type ZnDialogModule from './dialog-module.component';

class DialogModule {
  private _quill: Quill;
  private _dialog: ZnDialogModule;
  private _commands: CannedResponse[] = [];

  constructor(quill: Quill) {
    this._quill = quill;

    this.initDialog();
    this.attachEvents();
  }

  private initDialog() {
    this._dialog = this.createDialog()!;
    this._quill.container.ownerDocument.body.appendChild(this._dialog);
    this.addCommands();
  }

  private attachEvents() {
    document.addEventListener('zn-command-select', this.onCommandSelect);
  }

  private onCommandSelect = (e: ZnCommandSelectEvent) => {
    const item = e.detail.item;
    const command = item.getAttribute('data-command');
    if (command) {
      this.triggerCommand(this._commands.find((c) => c.title === command)!);
    }
  };

  private createDialog() {
    const dialog = html`
      <zn-dialog-module anchor=${this._quill.container}></zn-dialog-module>`

    return litToHTML<ZnDialogModule>(dialog);
  }

  private addCommands() {
    this._dialog.setAttribute('commands', JSON.stringify(this._commands));
  }

  private triggerCommand(command: CannedResponse) {
    this._dialog.dialogEl.close();
    const delta = this._quill.clipboard.convert({html: command?.content});
    this._quill.setContents(delta, 'silent');
    this._quill.update();
    this._quill.focus();
  }
}

export default DialogModule;
