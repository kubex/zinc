import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, nothing, type PropertyValues, unsafeCSS} from "lit";
import {property, query, state} from "lit/decorators.js";
import {watch} from "../../../../internal/watch";
import ZincElement from "../../../../internal/zinc-element";

import styles from './dialog.scss';

export default class DialogComponent extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @state() private hasFocus = false;

  @query('dialog') dialogEl!: HTMLDialogElement;

  @property({type: Boolean, reflect: true}) open = false;
  @property() uri = '';

  private closeWatcher: CloseWatcher | null;
  private _editorId: string;
  set editorId(value: string) {
    this._editorId = value;
    this.requestUpdate();
  }

  connectedCallback() {
    super.connectedCallback();
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);

    this.dialogEl.addEventListener("close", () => {
      this.open = false;
    });
  }

  setContent(content: string) {
    if (this.dialogEl) {
      this.dialogEl.querySelector('.editor-dialog__content')!.innerHTML = content;
    }
  }

  @watch('open', {waitUntilFirstUpdate: true})
  handleOpenChange() {
    if (this.open) {
      this.addOpenListeners();
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

  private _getLoadingState() {
    return html`
      <div class="loading-wrapper">
        <zn-skeleton height="55px"></zn-skeleton>
        <zn-skeleton height="55px"></zn-skeleton>
        <zn-skeleton height="55px"></zn-skeleton>
        <zn-skeleton height="55px"></zn-skeleton>
      </div>`;
  }

  // Defaults loading skeletons before content is fetched
  render() {
    return html`
      <dialog closedby="any"
              open="${this.open || nothing}"
              class="${classMap({
                'editor-dialog': true,
                'editor-dialog--has-focus': this.hasFocus,
              })}"
              context-data=${JSON.stringify({'editor-id': this._editorId})}>
        <zn-button
          class="editor-dialog__close"
          icon="close"
          icon-size="24"
          type="button"
          color="transparent"
          size="content"
          @click="${() => this.dialogEl.close()}"
        ></zn-button>
        <div class="editor-dialog__content">
          ${this._getLoadingState()}
        </div>
      </dialog>
    `;
  }
}

DialogComponent.define('zn-editor-dialog');
