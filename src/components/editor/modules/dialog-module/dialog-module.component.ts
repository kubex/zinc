import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, type TemplateResult, unsafeCSS} from "lit";
import {property, query, state} from "lit/decorators.js";
import {repeat} from "lit/directives/repeat.js";
import {watch} from "../../../../internal/watch";
import ZincElement from "../../../../internal/zinc-element";
import type {DialogModuleCannedResponse} from "./dialog-module";

import styles from './dialog-module.scss';

export default class DialogModuleComponent extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @state() private hasFocus = false;

  @query('zn-input#search-input') searchInput!: HTMLInputElement;
  @query('.dialog-module__content') commandList!: HTMLElement;

  @query('.dialog-module') dialogModule!: HTMLElement;

  @property({type: Array}) commands: DialogModuleCannedResponse[] = [];
  @property({type: Boolean, reflect: true}) open = false;

  private closeWatcher: CloseWatcher | null;

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this.handleKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.handleKeyDown);
  }

  private handleKeyDown(event: KeyboardEvent) {
    // Make a selection when pressing enter or space
    if (event.key === 'Enter' || event.key === ' ') {
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

  unsetCurrentItem() {
    const items = this.getAllItems();

    // Update tab indexes
    items.forEach(i => {
      i.setAttribute('tabindex', '-1');
    });
  }

  setCurrentItem(item: HTMLElement) {
    const items = this.getAllItems();

    // Update tab indexes
    items.forEach(i => {
      i.setAttribute('tabindex', i === item ? '0' : '-1');
    });
  }

  private handleFocus() {
    this.hasFocus = true;
    this.dialogModule?.focus();
    this.emit('zn-focus');
  }

  private handleBlur() {
    this.hasFocus = false;
    this.dialogModule?.blur();
    this.emit('zn-blur');
  }

  focus() {
    this.searchInput.focus();
  }

  show() {
    this.open = true;
    this.emit('zn-show');
    this.searchInput.focus();
  }

  hide() {
    this.open = false;
    this.unsetCurrentItem();
    this.emit('zn-close');
    this.blur();
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

    this.hide();
  }

  private handleClick = (event: MouseEvent) => {
    const target = event.composedPath().find((el: EventTarget) => {
      return (el as HTMLElement).getAttribute('data-command') !== null;
    });

    if (!target) return;

    const item = target as HTMLElement;
    this.emit('zn-command-select', {detail: {item}});
  }

  private _createCommand(command: DialogModuleCannedResponse): TemplateResult {
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
      <div data-command="${command.title}" class="command__wrapper" @click="${this.handleClick}">
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

  render() {
    return html`
      <div class="${classMap({
        'dialog-module': true,
        'dialog-module--has-focus': this.hasFocus,
        'dialog-module--has-results': this.commands.length > 0,
        'dialog-module--open': this.open,
      })}">

        <div class="dialog-module__header">
          Canned Responses
        </div>

        <zn-input id="search-input" type="search" placeholder="Search..." class="search-input"
                  autocomplete="off" autocorrect="off" spellcheck="false"
                  @focus="${this.handleFocus}" @blur="${this.handleBlur}"></zn-input>

        <div class="dialog-module__content">
          ${repeat(this.commands, (command: DialogModuleCannedResponse) => this._createCommand(command))}
        </div>

        <slot></slot>

      </div>
    `;
  }

}

DialogModuleComponent.define('zn-dialog-module');
