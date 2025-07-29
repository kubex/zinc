import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, type TemplateResult, unsafeCSS} from "lit";
import {property, query, state} from "lit/decorators.js";
import {watch} from "../../../../internal/watch";
import ZincElement from "../../../../internal/zinc-element";
import type {CannedResponse} from "../../editor.component";
import type ZnMenu from "../../../menu";

import styles from './menu-module.scss';

export default class MenuModuleComponent extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @state() private hasFocus = false;

  @query('zn-menu') menuEl!: ZnMenu;

  @query('.menu-module__content') commandList!: HTMLElement;

  @query('.menu-module') menuModule!: HTMLElement;

  @property({type: Array}) commands: CannedResponse[] = [];
  @property({type: Boolean, reflect: true}) open = false;

  private closeWatcher: CloseWatcher | null;

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('zn-menu-ready', this.focus);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('zn-menu-ready', this.focus);
  }

  focus() {
    // Focus the first menu item if available, otherwise fallback to menuEl
    const firstItem = this.menuEl?.getAllItems?.()[0];
    if (firstItem) {
      firstItem.focus();
    } else {
      this.menuEl?.focus();
    }
  }

  show() {
    this.open = true;
    this.emit('zn-show');
    this.focus();
  }

  hide() {
    this.open = false;
    this.emit('zn-close');
    this.blur();
  }

  @watch('open', {waitUntilFirstUpdate: true})
  handleOpenChange() {
    if (this.open) {
      this.addOpenListeners();
      this.menuEl.style.display = 'block';
      setTimeout(() => this.focus(), 0);
    } else {
      this.menuEl.style.display = 'none';
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

  private showDialog = () => {
    this.hide();
    this.emit('zn-show-canned-response-dialog', {detail: {commands: this.commands}});
  }

  private handleClick = (event: MouseEvent) => {
    const target = event.target

    if (!target) return;

    const item = target as HTMLElement;
    this.emit('zn-command-select', {detail: {item}});
  }

  private _createCommand(command: CannedResponse): TemplateResult {
    return html`
      <zn-menu-item data-command="${command.title}" @click="${this.handleClick}">
        <div class="command__wrapper">
          <div class="command__command">
            ${'/' + (command.command ? command.command :
              command.title.toLowerCase().replace(' ', '-'))}
          </div>
          <div class="command__title">
            ${command.title}
          </div>
        </div>
      </zn-menu-item>`
  }

  render() {
    return html`
      <zn-menu class="${classMap({
        'menu-module': true,
        'menu-module--has-focus': this.hasFocus,
        'menu-module--has-results': this.commands.length > 0,
        'menu-module--open': this.open,
      })}">
        ${this.commands.sort((a, b) => parseInt(b.count) - parseInt(a.count))
          .slice(0, 3)
          .map(command => this._createCommand(command))}
        <zn-menu-item @click="${this.showDialog}">View All</zn-menu-item>
      </zn-menu>
    `;
  }

}

MenuModuleComponent.define('zn-menu-module');
