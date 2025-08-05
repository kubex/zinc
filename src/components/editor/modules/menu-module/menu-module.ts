import './menu-module.component';
import {html} from "lit";
import {litToHTML} from "../../../../utilities/lit-to-html";
import {type ZnCommandSelectEvent} from "../events/zn-command-select";
import Quill, {Delta} from 'quill';
import type {CannedResponse} from "../../editor.component";
import type ZnMenuModule from './menu-module.component';

interface MenuModuleOptions {
  cannedResponses: CannedResponse[];
  cannedResponsesUri: string;
}

export let menuOpen: boolean = false;

class MenuModule {
  private _quill: Quill;
  private _menu: ZnMenuModule;
  private readonly _cannedResponsesUri: string = '';
  private _commands: CannedResponse[] = [];

  constructor(quill: Quill, options: MenuModuleOptions) {
    this._quill = quill;
    this._cannedResponsesUri = options.cannedResponsesUri?.trim() || '';
    this._commands = options.cannedResponses || [];

    if (this._commands.length > 0 || this._cannedResponsesUri) {
      this.initMenu();
      this.attachEvents();
    }
  }

  private initMenu() {
    this._menu = this.createMenu()!;
    this._quill.container.ownerDocument.body.appendChild(this._menu);
    this.updateMenuPosition();
    this.addCommands();
  }

  private attachEvents() {
    this._quill.on(Quill.events.TEXT_CHANGE, this.onTextChange);
    document.addEventListener('zn-command-select', this.onCommandSelect);
    document.addEventListener('click', this.onDocumentClick);
    this._menu.addEventListener('zn-show', () => setTimeout(() => this.updateMenuPosition(), 1));
  }

  private detachEvents() {
    document.removeEventListener('zn-command-select', this.onCommandSelect);
    document.removeEventListener('click', this.onDocumentClick);
    this._menu.removeEventListener('zn-show', () => setTimeout(() => this.updateMenuPosition(), 1));
  }

  private onTextChange = async (_: Delta, _oldDelta: Delta, source: string) => {
    if (source === Quill.sources.USER) {
      // if the user has typed a forward slash, we will show the menu until they type
      // a space or a new line. The menu will contain a list of commands that the user
      // can select from.
      const text = this._quill.getText();
      const index = this._quill.getSelection()?.index ?? 0;
      const char = index === 0 ? text.charAt(0) : text.charAt(index - 1); // Last input char
      const openCharacter = '/';

      // If the openCharacter is the first character in the editor, and menu isn't open, open it.
      if (index === 0 && char === openCharacter && !menuOpen) {
        await this._openMenu();
      } else if (char === openCharacter && text.charAt(index - 2) === ' ' && !menuOpen) {
        await this._openMenu();
      }

      // if the user has typed a space or a new line, we will close the menu if the menu
      // is open
      if (menuOpen && (char === ' ' || char === '\n')) {
        this._closeMenu();
      }

      if (menuOpen) {
        this.updateMenuPosition();
      }

      // if the user clicks away from the menu, we will close the menu
      document.addEventListener('click', (e) => {
        if (menuOpen && e.target !== this._menu) {
          this._closeMenu();
        }
      });
    }
  }

  private onCommandSelect = (e: Event) => {
    const event = e as ZnCommandSelectEvent;
    const commandTitle = event.detail.item.getAttribute('data-command');
    if (!commandTitle) return;
    const command = this._commands.find(cmd => cmd.title === commandTitle);
    if (command) {
      this.triggerCommand(command);
    }
  };

  private onDocumentClick = (e: MouseEvent) => {
    if (menuOpen && e.target !== this._menu) {
      this._closeMenu();
    }
  };

  private updateMenuPosition(menu: ZnMenuModule = this._menu) {
    const editorBounds = this._quill.container.getBoundingClientRect();

    // Get the current cursor position
    const range = this._quill.getSelection();
    if (range) {
      const cursorBounds = this._quill.getBounds(range.index);

      if (cursorBounds) {
        // Position the menu to the right of the cursor
        const maxHeight = 275;
        const top = editorBounds.top + cursorBounds.top;
        const left = editorBounds.left + cursorBounds.right + 10; // Add offset to the right
        const windowHeight = window.innerHeight;
        const hasRoom = windowHeight - top > maxHeight; // Check if there's enough room for the menu

        if (hasRoom) {
          menu.style.top = `${top}px`;
        } else {
          menu.style.top = `${top - maxHeight}px`;
        }

        menu.style.position = 'absolute';
        menu.style.left = `${left}px`;
        menu.style.maxHeight = `${maxHeight}px`;
      }
    }
  }

  private async _openMenu() {
    menuOpen = true;
    this.attachEvents();
    if (this._cannedResponsesUri) {
      await this.fetchCannedResponses();
    }

    if (this._commands.length > 0) {
      this._menu.show();
      this._menu.focus();
    }
  }

  private _closeMenu() {
    menuOpen = false;
    this.detachEvents();
    this._menu.hide();
  }

  private createMenu() {
    const menu = html`
      <zn-menu-module anchor=${this._quill.container}></zn-menu-module>`

    return litToHTML<ZnMenuModule>(menu);
  }

  private addCommands() {
    this._menu.setAttribute('commands', JSON.stringify(this._commands));
  }

  private triggerCommand(command: CannedResponse) {
    this._closeMenu();
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

  private async fetchCannedResponses() {
    try {
      const response = await fetch(this._cannedResponsesUri);
      this._commands = await response.json() as CannedResponse[];
      if (this._menu) {
        this.addCommands();
      }
    } catch (error) {
      console.error('Error fetching canned responses', error);
    }
  }
}

export default MenuModule;
