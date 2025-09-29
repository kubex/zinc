import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, nothing, type PropertyValues, type TemplateResult, unsafeCSS} from "lit";
import {property, query, state} from "lit/decorators.js";
import {repeat} from "lit/directives/repeat.js";
import {watch} from "../../../../internal/watch";
import ZincElement from "../../../../internal/zinc-element";
import type {Commands} from "../../editor.component";
import type {ZnInputEvent} from "../../../../events/zn-input";
import type ZnInput from "../../../input";

import styles from './canned-response.scss';

export default class CannedResponseComponent extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @state() private hasFocus = false;
  @state() private isSearching = false;

  @query('dialog') dialogEl!: HTMLDialogElement;

  @query('zn-input#search-input') searchInput!: ZnInput;
  @query('.canned-response__content') commandList!: HTMLElement;

  @property({type: Array, reflect: true}) commands: Commands[] = [];
  @property({type: Boolean, reflect: true}) open = false;

  @property({type: Function}) onCommandSelect?: (command: Commands) => void;

  private _allCommands: Commands[] = [];
  set allCommands(value: Commands[]) {
    this._allCommands = value;
  }

  private closeWatcher: CloseWatcher | null;

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this.handleKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.handleKeyDown);
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);

    this.dialogEl.addEventListener("close", () => {
      this.open = false;
    });
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      const item = this.getCurrentItem();
      event.preventDefault();
      event.stopPropagation();

      // Simulate a click to support @click handlers on menu items that also work with the keyboard
      item?.click();
    }

    // Move the selection when pressing down or up
    else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      const items = this.getAllItems();
      const activeItem = this.getCurrentItem();
      let index = activeItem ? items.indexOf(activeItem) : 0;

      if (!activeItem) {
        this.setCurrentItem(items[0]);
        items[0].focus();
        return;
      }

      if (items.length > 0) {
        event.preventDefault();
        event.stopPropagation();

        if (event.key === 'ArrowDown') {
          index++;
        } else if (event.key === 'ArrowUp') {
          index--;
        } else if (event.key === 'Home') {
          index = 0;
        } else if (event.key === 'End') {
          index = items.length - 1;
        }

        if (index < 0) {
          index = items.length - 1;
        }
        if (index > items.length - 1) {
          index = 0;
        }

        this.setCurrentItem(items[index]);
        items[index].focus();
      }
    }
  }

  private _handleClick = (event: MouseEvent) => {
    const item = (event.target as HTMLElement).closest('.command__wrapper');
    if (!item) return;

    const commandTitle = item.getAttribute('data-command');
    const command = this._allCommands.find(c => c.title === commandTitle);
    if (command && this.onCommandSelect) {
      this.onCommandSelect(command);
    }
  }

  getAllItems() {
    if (!this.commandList) {
      return [];
    }

    return [...this.commandList.children].filter((el: HTMLElement) => {
      return el.getAttribute('data-command') !== null;
    }) as HTMLElement[];
  }

  getCurrentItem() {
    return this.getAllItems().find(i => i.getAttribute('tabindex') === '0');
  }

  setCurrentItem(item: HTMLElement) {
    const items = this.getAllItems();

    // Update tab indexes
    items.forEach(i => {
      i.setAttribute('tabindex', i === item ? '0' : '-1');
    });
  }

  focus() {
    this.searchInput.focus();
  }

  @watch('open', {waitUntilFirstUpdate: true})
  handleOpenChange() {
    if (this.open) {
      this.addOpenListeners();
      setTimeout(() => this.focus(), 0);
    } else {
      this.removeOpenListeners();
    }
  }

  private addOpenListeners() {
    if ('CloseWatcher' in window) {
      this.closeWatcher?.destroy();
      this.closeWatcher = new CloseWatcher();
      this.closeWatcher.onclose = () => this.requestClose('keyboard');
    }
  }

  private removeOpenListeners() {
    this.closeWatcher?.destroy();
  }

  private requestClose(source: 'close-button' | 'keyboard' | 'overlay') {
    const znRequestClose = this.emit('zn-request-close', {
      cancelable: true,
      detail: {source}
    });

    if (znRequestClose.defaultPrevented) {
      return;
    }

    this.dialogEl.close();
  }

  private _createCommand(command: Commands): TemplateResult {
    const labels: string[] = [];
    if (command.labels) {
      command.labels.forEach((label: string) => {
        if (label.includes(',')) {
          labels.push(...label.split(',').map((l: string) => l.trim()));
        } else {
          labels.push(label);
        }
      });
    }

    return html`
      <div data-command="${command.title}" class="command__wrapper" @click="${this._handleClick}">
        <div class="command__left">
          <div class="command__command">
            ${'/' + (command.command ? command.command :
              command.title.toLowerCase().replace(' ', '-'))}
          </div>
          <div class="command__labels">
            ${repeat(labels, (label: string) => html`
              <zn-chip class="command__labels__label" size="small"># ${label}</zn-label>
            `)}
          </div>
        </div>
        <div class="command__right">
          <div class="command__title">
            ${command.title}
          </div>
          <div class="command__snippet">
            ${command.content.length > 50 ? command.content.substring(0, 50) + '...' : command.content}
          </div>
        </div>
      </div>`
  }

  private isFuzzyMatch(target: string, search: string): boolean {
    let tIdx = 0;
    let sIdx = 0;
    target = target.toLowerCase();
    search = search.toLowerCase();
    while (tIdx < target.length && sIdx < search.length) {
      if (target[tIdx] === search[sIdx]) sIdx++;
      tIdx++;
    }
    return sIdx === search.length;
  }

  handleSearch(event: ZnInputEvent) {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const searchValue = target.value.trim().toLowerCase();
    this.isSearching = !!searchValue;
    if (!searchValue) {
      this.commands = [...this._allCommands];
      return;
    }
    this.commands = this._allCommands.filter(command =>
      this.isFuzzyMatch(command.title, searchValue) ||
      this.isFuzzyMatch(command.content, searchValue) ||
      (command.labels && command.labels.some(label => this.isFuzzyMatch(label, searchValue)))
    );
  }

  render() {
    const visibleCommands = this.isSearching
      ? this.commands
      : this.commands.sort((a, b) => parseInt(b.count) - parseInt(a.count))
        .slice(0, 5);
    return html`
      <dialog closedby="any"
              open="${this.open || nothing}"
              class="${classMap({
                'canned-response': true,
                'canned-response--has-focus': this.hasFocus,
                'canned-response--has-results': visibleCommands.length > 0,
              })}">

        <div class="canned-response__header">
          <div class="canned-response__header--caption">
            Canned Responses
          </div>

          <div class="canned-response__header--search">
            <zn-input id="search-input"
                      type="search"
                      placeholder="Search..."
                      class="search-input"
                      autocomplete="off"
                      autocorrect="off"
                      @zn-input="${this.handleSearch}">
              <zn-icon src="search" slot="prefix"></zn-icon>
            </zn-input>
          </div>
        </div>

        <div class="canned-response__body">
          <div class="canned-response__content">
            ${repeat(visibleCommands, (command: Commands) => this._createCommand(command))}
          </div>

          <slot></slot>
        </div>

        <div class="canned-response__footer">
          <div>
            Showing ${visibleCommands.length} of ${this._allCommands.length} responses
          </div>
          <zn-button class="canned-response__close-button"
                     size="medium"
                     color="secondary"
                     @click="${() => this.requestClose('close-button')}">
            Close
          </zn-button>
        </div>
      </dialog>
    `;
  }
}

CannedResponseComponent.define('zn-canned-response');
