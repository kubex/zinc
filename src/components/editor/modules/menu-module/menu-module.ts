import './menu-module.component';
import {html} from "lit";
import {litToHTML} from "../../../../utilities/lit-to-html";
import {type ZnCommandSelectEvent} from "../events/zn-command-select";
import Quill, {type Delta} from 'quill';
import type ZnMenuModule from './menu-module.component';

interface MenuModuleOptions {
  cannedResponses: MenuModuleCannedResponse[];
  cannedResponsesUri: string;
}

export interface MenuModuleCannedResponse {
  title: string;
  content: string;
  command: string;
  labels?: string[];
  count: string;
}

export let menuOpen: boolean = false;

class MenuModule {
  private _quill: Quill;
  private readonly _menu: ZnMenuModule;
  private readonly _cannedResponsesUri: string = '';
  private _commands: MenuModuleCannedResponse[] = [];

  constructor(quill: Quill, options: MenuModuleOptions) {
    this._quill = quill;

    if (options.cannedResponses) {
      this._commands = options.cannedResponses;
    }

    if (options.cannedResponsesUri !== ' ') {
      this._cannedResponsesUri = options.cannedResponsesUri;
    }

    if (this._commands.length > 0 || this._cannedResponsesUri !== '') {
      quill.on(Quill.events.TEXT_CHANGE, this.onTextChange);

      // Create the menu element
      const menu = this.createMenu();
      if (!menu) {
        throw new Error('Menu element not found');
      }
      this._menu = menu;
      this._quill.container.ownerDocument.body.appendChild(this._menu);

      // Add menu commands
      this.updateMenuPosition();
      this.addCommands();

      // Listen to zn-command-select event
      document.addEventListener('zn-command-select', (e: ZnCommandSelectEvent) => {
        const item = e.detail.item;
        const command = item.getAttribute('data-command');
        if (command) {
          this.triggerCommand(this._commands.find((c) => c.title === command)!);
        }
      });
      this._menu.addEventListener('zn-show', () => {
        setTimeout(() => this.updateMenuPosition(this._menu), 1);
      })
    }
  }

  onTextChange = (_: Delta, _oldDelta: Delta, source: string) => {
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

  updateMenuPosition(menu: ZnMenuModule = this._menu) {
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

  openMenu() {
    menuOpen = true;
    if (this._cannedResponsesUri) {
      this.getMenuContentFromUri();
    }
    this._menu.show();
    this._menu.focus();
  }

  closeMenu() {
    menuOpen = false;
    this._menu.hide();
  }

  createMenu() {
    const menu = html`
      <zn-menu-module anchor=${this._quill.container}></zn-menu-module>`

    return litToHTML<ZnMenuModule>(menu);
  }

  addCommands() {
    this._menu.setAttribute('commands', JSON.stringify(this._commands));
  }

  triggerCommand(command: MenuModuleCannedResponse) {
    this.closeMenu();

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

  private getMenuContentFromUri() {
    if (this._cannedResponsesUri) {
      fetch(this._cannedResponsesUri)
        .then(response => response.json())
        .then((data: MenuModuleCannedResponse[]) => {
          this._commands = data;
          this.addCommands();
        }).catch(error => {
        console.error('Error fetching canned responses', error);
      });
    }
  }
}

export default MenuModule;
