import './dialog-module.component';
import {html} from "lit";
import {litToHTML} from "../../../../utilities/lit-to-html";
import {type ZnCommandSelectEvent} from "./events/zn-command-select";
import Quill, {type Delta} from 'quill';
import type ZnDialogModule from './dialog-module.component';

interface DialogModuleOptions {
  cannedResponses: DialogModuleCannedResponse[];
  cannedResponsesUri: string;
}

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
  private readonly _cannedResponsesUri: string = '';
  private _commands: DialogModuleCannedResponse[] = [];

  constructor(quill: Quill, options: DialogModuleOptions) {
    this._quill = quill;

    if (options.cannedResponses) {
      this._commands = options.cannedResponses;
    }

    if (options.cannedResponsesUri !== ' ') {
      this._cannedResponsesUri = options.cannedResponsesUri;
    }

    if (this._commands.length > 0 || this._cannedResponsesUri !== '') {
      quill.on(Quill.events.TEXT_CHANGE, this.onTextChange);

      // Create the dialog element
      const dialog = this.createDialog();
      if (!dialog) {
        throw new Error('Dialog element not found');
      }
      this._dialog = dialog;
      this._quill.container.ownerDocument.body.appendChild(this._dialog);

      // Update position and add commands
      this.updateDialogPosition();
      this.addCommands();

      // Listen to zn-command-select event
      document.addEventListener('zn-command-select', (e: ZnCommandSelectEvent) => {
        const item = e.detail.item;
        const command = item.getAttribute('data-command');
        if (command) {
          this.triggerCommand(this._commands.find((c) => c.title === command)!);
        }
      });
      this._dialog.addEventListener('zn-show', () => {
        setTimeout(() => this.updateDialogPosition(this._dialog), 1);
      })
    }
  }

  onTextChange = (_: Delta, _oldDelta: Delta, source: string) => {
    if (source === Quill.sources.USER) {
      // if the user has typed a forward slash, we will show the dialog until they type
      // a space or a new line. The dialog will contain a list of commands that the user
      // can select from.
      const text = this._quill.getText();
      const index = this._quill.getSelection()?.index ?? 0;
      const char = index === 0 ? text.charAt(0) : text.charAt(index - 1); // Last input char
      const openCharacter = '/';

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

      // if the dialog is open, we will filter the commands based on the text that the user has typed
      // after the forward slash
      if (dialogOpen) {
        this.updateDialogPosition();
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
    if (this._cannedResponsesUri) {
      this.getDialogContentFromUri();
    }
    // add to the document out of shadow dom
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

  updateDialogPosition(dialog: ZnDialogModule = this._dialog) {
    const editorBounds = this._quill.container.getBoundingClientRect();

    // position bottom of the dialog at the top of the editor
    const top = (editorBounds.top + this._quill.container.scrollTop) - dialog.offsetHeight;

    // dialog should be full width of the editor
    const left = editorBounds.left;
    const right = editorBounds.right;
    const width = editorBounds.width;

    dialog.style.top = top + 'px';
    dialog.style.left = left + 'px';
    dialog.style.right = right + 'px';
    dialog.style.width = width + 'px';
    dialog.style.maxHeight = '200px';
  }

  addCommands() {
    // Add close command
    this._commands.push({
      title: 'Close',
      command: '',
      content: '',
    } satisfies DialogModuleCannedResponse);


    this._dialog.setAttribute('commands', JSON.stringify(this._commands));
  }

  triggerCommand(command: DialogModuleCannedResponse) {
    this.closeDialog();

    // insert the command content
    const delta = this._quill.clipboard.convert({html: command.content});
    this._quill.setContents(delta, 'silent');
    // update the quill editor
    this._quill.update();

    this._quill.focus();
    // Set cursor position to the end of the inserted content
    const range = this._quill.getSelection()?.index || 0;
    setTimeout(() => range + 10, 1000);
  }

  private getDialogContentFromUri() {
    if (this._cannedResponsesUri) {
      fetch(this._cannedResponsesUri)
        .then(response => response.json())
        .then((data: DialogModuleCannedResponse[]) => {
          this._commands = data;
          this.addCommands();
        }).catch(error => {
        console.error('Error fetching canned responses', error);
      });
    }
  }
}

export default DialogModule;
