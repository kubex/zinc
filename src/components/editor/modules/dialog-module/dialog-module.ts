import './dialog-module.component';
import {html} from "lit";
import {litToHTML} from "../../../../utilities/lit-to-html";
import {type ZnCommandSelectEvent} from "../events/zn-command-select";
import Quill, {type Delta} from 'quill';
import type ZnDialogModule from './dialog-module.component';

export interface DialogModuleCannedResponse {
  title: string;
  content: string;
  command: string;
  labels?: string[];
}

export let dialogOpen: boolean = false;

class DialogModule {
  private _quill: Quill;
  private readonly _dialog: ZnDialogModule;
  private _commands: DialogModuleCannedResponse[] = [];

  constructor(quill: Quill) {
    this._quill = quill;

    quill.on(Quill.events.TEXT_CHANGE, this.onTextChange);

    // Create the dialog element
    const dialog = this.createDialog();
    if (!dialog) {
      throw new Error('Dialog element not found');
    }
    this._dialog = dialog;
    this._quill.container.ownerDocument.body.appendChild(this._dialog);

    // Add dialog commands
    this.addCommands();

    // Listen to zn-command-select event
    document.addEventListener('zn-command-select', (e: ZnCommandSelectEvent) => {
      const item = e.detail.item;
      const command = item.getAttribute('data-command');
      if (command) {
        this.triggerCommand(this._commands.find((c) => c.title === command)!);
      }
    });
  }

  onTextChange = (_: Delta, _oldDelta: Delta, source: string) => {
    if (source === Quill.sources.USER) {
      // if the user has typed a forward slash, we will show the dialog until they type
      // a space or a new line. The dialog will contain a list of commands that the user
      // can select from.
      const text = this._quill.getText();
      const index = this._quill.getSelection()?.index ?? 0;
      const char = index === 0 ? text.charAt(0) : text.charAt(index - 1); // Last input char
      const openCharacter = '~';

      // If the openCharacter is the first character in the editor, and dialog isn't open, open it.
      if (index === 0 && char === openCharacter && !dialogOpen) {
        this.openDialog();
      } else if (char === openCharacter && text.charAt(index - 2) === ' ' && !dialogOpen) {
        this.openDialog();
      }

      // if the user has typed a space or a new line, we will close the dialog if the dialog
      // is open
      if (dialogOpen && (char === ' ' || char === '\n')) {
        this.closeDialog();
      }

      // if the user clicks away from the dialog, we will close the dialog
      document.addEventListener('click', (e) => {
        if (dialogOpen && e.target !== this._dialog) {
          this.closeDialog();
        }
      });
    }
  }

  openDialog() {
    dialogOpen = true;
    this._dialog.show();
  }

  closeDialog() {
    dialogOpen = false;
    this._dialog.hide();
  }

  createDialog() {
    const dialog = html`
      <zn-dialog-module anchor=${this._quill.container}></zn-dialog-module>`

    return litToHTML<ZnDialogModule>(dialog);
  }

  addCommands() {
    this._dialog.setAttribute('commands', JSON.stringify(this._commands));
  }

  triggerCommand(command: DialogModuleCannedResponse) {
    this.closeDialog();

    // insert the command content
    const delta = this._quill.clipboard.convert({html: command?.content});
    this._quill.setContents(delta, 'silent');
    // update the quill editor
    this._quill.update();

    this._quill.focus();
    // Set cursor position to the end of the inserted content
    const range = this._quill.getSelection()?.index || 0;
    setTimeout(() => range + 10, 1000);
  }
}

export default DialogModule;
