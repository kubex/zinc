import {classMap} from "lit/directives/class-map.js";
import type {PropertyValues} from "lit";
import {type CSSResultGroup, html, type TemplateResult, unsafeCSS} from "lit";
import {property, query, state} from "lit/decorators.js";
import {repeat} from "lit/directives/repeat.js";
import {watch} from "../../../../internal/watch";
import ZincElement from "../../../../internal/zinc-element";
import type {DropdownModuleCannedResponse} from "./dropdown-module";

import styles from './dropdown-module.scss';


export default class DropdownModuleComponent extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @state() private hasFocus = false;

  @query('zn-input#search-input') searchInput!: HTMLInputElement;
  @query('.dropdown-module__content') commandList!: HTMLElement;

  @property({type: Array}) commands: DropdownModuleCannedResponse[] = [];
  @property({type: Boolean, reflect: true}) open = false;

  private closeWatcher: CloseWatcher | null;

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    console.log('search input', this.searchInput);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this.handleKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.handleKeyDown);
  }

  focus() {
    this.searchInput.focus();
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
    this.emit('zn-focus');
  }

  private handleBlur() {
    this.hasFocus = false;
    this.emit('zn-blur');
  }

  show() {
    this.open = true;
    this.emit('zn-show');
  }

  hide() {
    this.open = false;
    this.unsetCurrentItem();
    this.emit('zn-close');
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

  render() {
    return html`
      <div class="${classMap({
        'dropdown-module': true,
        'dropdown-module--has-focus': this.hasFocus,
        'dropdown-module--has-results': this.commands.length > 0,
        'dropdown-module--open': this.open,
      })}">

        <div class="dropdown-module__header">
          Canned Responses
        </div>

        <zn-input id="search-input" type="search" placeholder="Search..." class="search-input"
                  autocomplete="off" autocorrect="off" spellcheck="false"
                  @focus="${this.handleFocus}" @blur="${this.handleBlur}"></zn-input>

        <div class="dropdown-module__content">
          ${repeat(this.commands, (command: DropdownModuleCannedResponse) => this._createCommand(command))}
        </div>

        <slot></slot>

      </div>
    `;
  }

  private handleClick = (event: MouseEvent) => {
    const target = event.composedPath().find((el: EventTarget) => {
      return (el as HTMLElement).getAttribute('data-command') !== null;
    });

    if (!target) return;

    const item = target as HTMLElement;
    this.emit('zn-command-select', {detail: {item}});
    console.log('Command clicked', target);
  }

  private _createCommand(command: DropdownModuleCannedResponse): TemplateResult {
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
}

DropdownModuleComponent.define('zn-dropdown-module');
