import './menu-module.component';
import {html} from "lit";
import {litToHTML} from "../../../../utilities/lit-to-html";
import {type ZnCommandSelectEvent} from "../events/zn-command-select";
import Quill, {type Delta} from 'quill';
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
      if (index === 0 && char === openCharacter && !menuOpen) {
        this.openMenu();
      } else if (char === openCharacter && text.charAt(index - 2) === ' ' && !menuOpen) {
        this.openMenu();
      }

      // if the user has typed a space or a new line, we will close the menu if the menu
      // is open
      if (menuOpen && (char === ' ' || char === '\n')) {
        this.closeMenu();
      }

      if (menuOpen) {
        this.updateMenuPosition();
      }

      // if the user clicks away from the menu, we will close the menu
      document.addEventListener('click', (e) => {
        if (menuOpen && e.target !== this._menu) {
          this.closeMenu();
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
      this.closeMenu();
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
        const top = editorBounds.top + cursorBounds.top;
        const left = editorBounds.left + cursorBounds.right + 10; // Add offset to the right

        menu.style.position = 'absolute';
        menu.style.top = top + 'px';
        menu.style.left = left + 'px';
        menu.style.maxHeight = '200px';
      }
    }
  }

  private openMenu() {
    menuOpen = true;
    if (this._cannedResponsesUri) {
      this.fetchCannedResponses();
    }
    this._menu.show();
    this._menu.focus();
  }

  private closeMenu() {
    menuOpen = false;
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
    this.closeMenu();
    const delta = this._quill.clipboard.convert({html: command.content});
    this._quill.setContents(delta, 'silent');
    this._quill.update();
    this._quill.focus();
  }

  private fetchCannedResponses() {
    fetch(this._cannedResponsesUri)
      .then(response => response.json())
      .then((data: CannedResponse[]) => {
        this._commands = data;
        this.addCommands();
      })
      .catch(error => console.error('Error fetching canned responses', error));
  }
}

export default MenuModule;
