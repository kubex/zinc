import './menu-module.component';
import {html} from "lit";
import {litToHTML} from "../../../../utilities/lit-to-html";
import {type ZnCommandSelectEvent} from "../events/zn-command-select";
import Quill, {Delta} from 'quill';
import type {CannedResponse} from "../../editor.component";
import type ZnMenuModule from './menu-module.component';

export let menuOpen: boolean = false;

class MenuModule {
  private _quill: Quill;
  private _menu: ZnMenuModule;
  private _commands: CannedResponse[] = [];

  constructor(quill: Quill, options: { commands: CannedResponse[] }) {
    this._quill = quill;
    this._commands = options.commands || [];

    if (this._commands.length > 0) {
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

  private onTextChange = (_: Delta, _oldDelta: Delta, source: string) => {
    if (source === Quill.sources.USER) {
      // if the user has typed a forward slash, we will show the menu until they type
      // a space or a new line. The menu will contain a list of commands that the user
      // can select from.
      const text = this._quill.getText();
      const index = this._quill.getSelection()?.index ?? 0;
      const char = index === 0 ? text.charAt(0) : text.charAt(index - 1); // Last input char
      const openCharacter = '/';

      // If the openCharacter is the first character in the editor, and menu isn't open, open it.
      if (char === openCharacter && !menuOpen) {
        this._openMenu();
      }

      // if the user has typed a space or a new line, we will close the menu if the menu is open
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
        // Position the menu to the top-right of the inserted slash
        const maxHeight = 275;
        const top = editorBounds.top + cursorBounds.top - maxHeight + 140; // Position above the slash
        const left = editorBounds.left + cursorBounds.right + 10; // Right of the slash
        const hasRoom = top > 0; // Ensure menu is not off the top of the viewport

        menu.style.position = 'absolute';
        menu.style.top = hasRoom ? `${top}px` : `30px`;
        menu.style.left = `${left}px`;
        menu.style.maxHeight = `${maxHeight}px`;
      }
    }
  }

  private _openMenu() {
    if (this._commands.length > 0) {
      menuOpen = true;
      this.attachEvents();
      this._menu.show();
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
}

export default MenuModule;
