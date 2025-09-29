import './canned-response-component';
import {Delta} from 'quill';
import {html} from "lit";
import {litToHTML} from "../../../../utilities/lit-to-html";
import type {Commands} from "../../editor.component";
import type CannedResponseComponent from './canned-response-component';
import type Quill from 'quill';
import type ToolbarComponent from "../toolbar/toolbar.component";

class CannedResponse {
  private _quill: Quill;
  private _dialog: CannedResponseComponent;
  private readonly _commands: Commands[] = [];

  constructor(quill: Quill, options: { commands: Commands[] }) {
    this._quill = quill;
    this._commands = options.commands || [];

    if (this._commands.length > 0) {
      this._initDialog();
    }
  }

  private _close() {
    this._dialog.dialogEl.close();
  }

  private _initDialog() {
    this.getToolbarDialogContainer().then((container) => {
      if (!container) return;

      container.innerHTML = '';

      this._dialog = this.createDialog()!;
      this._dialog.allCommands = this._commands;
      this._dialog.onCommandSelect = this.triggerCommand.bind(this);
      container.appendChild(this._dialog);
      this.addCommands();
    });
  }

  private async getToolbarDialogContainer(): Promise<HTMLElement | null> {
    try {
      const root = this._quill.container?.getRootNode?.() as ShadowRoot | null;
      if (!root) return null;

      const toolbar = root.getElementById?.('toolbar') as ToolbarComponent | null;
      await toolbar?.updateComplete;

      const shadow = toolbar?.shadowRoot as ShadowRoot | undefined;
      const container = shadow?.querySelector?.('.canned-response') as HTMLElement | null;
      return container ?? null;
    } catch {
      return null;
    }
  }

  private createDialog() {
    const cannedResponse = html`
      <zn-canned-response></zn-canned-response>`

    return litToHTML<CannedResponseComponent>(cannedResponse);
  }

  private addCommands() {
    this._dialog.setAttribute('commands', JSON.stringify(this._commands));
  }

  private triggerCommand(command: Commands) {
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

export default CannedResponse;
