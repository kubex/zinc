import './dialog-module.component';
import {Delta} from 'quill';
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

    document.addEventListener('zn-show-canned-response-dialog', () => {
      this._open();
    });
  }

  public setCommands(commands: CannedResponse[]) {
    this._commands = commands;
    this.addCommands();
  }

  private _open() {
    this._dialog.dialogEl.showModal();
    this.attachEvents();
  }

  private _close() {
    this._dialog.dialogEl.close();
    this.detachEvents();
  }

  private initDialog() {
    this._dialog = this.createDialog()!;
    this._quill.container.ownerDocument.body.appendChild(this._dialog);
    this.addCommands();
  }

  private attachEvents() {
    document.addEventListener('zn-command-select', this.onCommandSelect);
  }

  private detachEvents() {
    document.removeEventListener('zn-command-select', this.onCommandSelect);
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
    this._close();
    this._quill.focus();

    const range = this._quill.getSelection();
    if (range) {
      let insertIndex = range.index - 1;
      this._quill.deleteText(insertIndex, 1, 'user');

      const prevChar = this._quill.getText(insertIndex - 1, 1);
      if (prevChar !== ' ' && insertIndex > 0) {
        this._quill.insertText(insertIndex, ' ', 'user');
        insertIndex += 1;
      }

      const contentDelta = this._quill.clipboard.convert({html: command?.content});
      this._quill.updateContents(
        new Delta().retain(insertIndex).concat(contentDelta),
        'user'
      );

      setTimeout(() => this._quill.setSelection(insertIndex + contentDelta.length(), 0, 'silent'), 0);
      this._quill.focus();
    }
  }
}

export default DialogModule;
