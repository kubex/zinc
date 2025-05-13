import './dropdown-module.component';
import {html} from "lit";
import {litToHTML} from "../../../../utilities/lit-to-html";
import {type ZnCommandSelectEvent} from "./events/zn-command-select";
import Quill, {type Delta} from 'quill';
import type ZnDropdownModule from './dropdown-module.component';

interface DropdownModuleOptions {
  cannedResponses: DropdownModuleCannedResponse[];
  cannedResponsesUri: string;
}

export interface DropdownModuleCannedResponse {
  title: string;
  content: string;
  command: string;
  labels?: string[];
}

export let dropdownOpen: boolean = false;

class DropdownModule {
  private _quill: Quill;
  private readonly _dropdown: ZnDropdownModule;
  private readonly _cannedResponsesUri: string = '';
  private _commands: DropdownModuleCannedResponse[] = [];

  constructor(quill: Quill, options: DropdownModuleOptions) {
    this._quill = quill;

    if (options.cannedResponses) {
      this._commands = options.cannedResponses;
    }

    if (options.cannedResponsesUri !== ' ') {
      this._cannedResponsesUri = options.cannedResponsesUri;
    }

    if (this._commands.length > 0 || this._cannedResponsesUri !== '') {
      quill.on(Quill.events.TEXT_CHANGE, this.onTextChange);

      // Create the dropdown element
      const dropdown = this.createDropdown();
      if (!dropdown) {
        throw new Error('Dropdown element not found');
      }
      this._dropdown = dropdown;
      this._quill.container.ownerDocument.body.appendChild(this._dropdown);

      // Update position and add commands
      this.updateDropdownPosition();
      this.addCommands();

      // Listen to zn-command-select event
      document.addEventListener('zn-command-select', (e: ZnCommandSelectEvent) => {
        const item = e.detail.item;
        const command = item.getAttribute('data-command');
        if (command) {
          this.triggerCommand(this._commands.find((c) => c.title === command)!);
        }
      });
      this._dropdown.addEventListener('zn-show', () => {
        setTimeout(() => this.updateDropdownPosition(this._dropdown), 1);
      })
    }
  }

  onTextChange = (_: Delta, _oldDelta: Delta, source: string) => {
    if (source === Quill.sources.USER) {
      // if the user has typed a forward slash, we will show the dropdown until they type
      // a space or a new line. The dropdown will contain a list of commands that the user
      // can select from.
      const text = this._quill.getText();
      const index = this._quill.getSelection()?.index ?? 0;
      const char = index === 0 ? text.charAt(0) : text.charAt(index - 1); // Last input char
      const openCharacter = '/';

      // If the openCharacter is the first character in the editor, and dropdown isn't open, open it.
      if (index === 0 && char === openCharacter && !dropdownOpen) {
        this.openDropdown();
      } else if (char === openCharacter && text.charAt(index - 2) === ' ' && !dropdownOpen) {
        this.openDropdown();
      }

      // if the user has typed a space or a new line, we will close the dropdown if the dropdown
      // is open
      if (dropdownOpen && (char === ' ' || char === '\n')) {
        this.closeDropdown();
      }

      // if the dropdown is open, we will filter the commands based on the text that the user has typed
      // after the forward slash
      if (dropdownOpen) {
        this.updateDropdownPosition();
      }

      // if the user clicks away from the dropdown, we will close the dropdown
      document.addEventListener('click', (e) => {
        if (dropdownOpen && e.target !== this._dropdown) {
          this.closeDropdown();
        }
      });
    }
  }

  openDropdown() {
    dropdownOpen = true;
    if (this._cannedResponsesUri) {
      this.getDropdownContentFromUri();
    }
    // add to the document out of shadow dom
    console.log('open dropdown');
    console.log('dropdown', this._dropdown);
    this._dropdown.show();
  }

  closeDropdown() {
    dropdownOpen = false;
    this._dropdown.hide();
  }

  createDropdown() {
    const dropdown = html`
      <zn-dropdown-module anchor=${this._quill.container}></zn-dropdown-module>`

    return litToHTML<ZnDropdownModule>(dropdown);
  }

  updateDropdownPosition(dropdown: ZnDropdownModule = this._dropdown) {
    const editorBounds = this._quill.container.getBoundingClientRect();

    // position bottom of the dropdown at the top of the editor
    const top = (editorBounds.top + this._quill.container.scrollTop) - dropdown.offsetHeight;

    // dropdown should be full width of the editor
    const left = editorBounds.left;
    const right = editorBounds.right;
    const width = editorBounds.width;

    dropdown.style.top = top + 'px';
    dropdown.style.left = left + 'px';
    dropdown.style.right = right + 'px';
    dropdown.style.width = width + 'px';
    dropdown.style.maxHeight = '200px';
  }

  addCommands() {
    // Add close command
    this._commands.push({
      title: 'Close',
      command: '',
      content: '',
    } satisfies DropdownModuleCannedResponse);


    this._dropdown.setAttribute('commands', JSON.stringify(this._commands));
  }

  triggerCommand(command: DropdownModuleCannedResponse) {
    this.closeDropdown();

    // insert the command content
    const delta = this._quill.clipboard.convert({html: command.content});
    this._quill.setContents(delta, 'silent');
    // update the quill editor
    this._quill.update();
    // Set cursor position to the end of the inserted content
    const range = this._quill.getSelection();
    if (range) {
      setTimeout(() => this._quill.setSelection(range.index + 10, 0), 0)
    }
  }

  private getDropdownContentFromUri() {
    if (this._cannedResponsesUri) {
      fetch(this._cannedResponsesUri)
        .then(response => response.json())
        .then((data: DropdownModuleCannedResponse[]) => {
          this._commands = data;
          this.addCommands();
        }).catch(error => {
        console.error('Error fetching canned responses', error);
      });
    }
  }
}

export default DropdownModule;
