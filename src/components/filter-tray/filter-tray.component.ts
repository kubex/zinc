import {type CSSResultGroup, html, nothing, type PropertyValues, unsafeCSS} from 'lit';
import {lockBodyScrolling, unlockBodyScrolling} from '../../internal/scroll';
import {property, query} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import ZnButton from '../button';

import styles from './filter-tray.scss';

/**
 * @summary Lays a toolbar's filter controls out inline, and on narrow screens folds them behind one summary button
 * that opens them in a bottom sheet.
 * @documentation https://zinc.style/components/filter-tray
 * @status experimental
 * @since 2.0
 *
 * @dependency zn-button
 *
 * @event zn-show - Emitted when the sheet opens.
 * @event zn-close - Emitted when the sheet closes.
 * @event zn-collapse - Emitted when the controls fold into the sheet.
 * @event zn-expand - Emitted when the controls return inline.
 *
 * @slot - The filter controls: search, date range, filter, group-by and the like.
 * @slot header-actions - Beside the sheet's heading, such as a reset button.
 *
 * @csspart trigger - The summary button shown while collapsed.
 * @csspart sheet - The bottom sheet.
 * @csspart header - The sheet's header.
 * @csspart body - The sheet's body, holding the controls.
 * @csspart footer - The sheet's footer.
 */
export default class ZnFilterTray extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-button': ZnButton,
  };

  @query('.tray__sheet') sheet: HTMLDialogElement;

  /** The sheet's heading, and the trigger's text when there is no summary. */
  @property() label = 'Filters';

  /** What the controls are set to, shown on the trigger, e.g. "1–31 Oct 2026 · Department". */
  @property() summary = '';

  /** How many filters are applied, shown as a badge on the trigger. */
  @property({type: Number}) count = 0;

  /** The text of the button that closes the sheet. */
  @property({attribute: 'done-label'}) doneLabel = 'Done';

  /** The viewport width, in px, at or below which the controls fold into the sheet. */
  @property({type: Number}) breakpoint = 640;

  /** Set while the viewport is at or below the breakpoint. Read only. */
  @property({type: Boolean, reflect: true}) collapsed = false;

  /** Whether the sheet is open. Only takes effect while collapsed. */
  @property({type: Boolean, reflect: true}) open = false;

  private media: MediaQueryList | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.watchMedia();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.media?.removeEventListener('change', this.syncCollapsed);
    this.media = null;
    unlockBodyScrolling(this);
  }

  protected willUpdate(changed: PropertyValues<this>) {
    if (changed.has('breakpoint') && changed.get('breakpoint') !== undefined) {
      this.watchMedia();
    }
    if (!this.collapsed) {
      this.open = false;
    }
  }

  protected updated(changed: PropertyValues<this>) {
    if (changed.has('collapsed')) {
      this.emit(this.collapsed ? 'zn-collapse' : 'zn-expand');
    }
    if (!changed.has('open') && !changed.has('collapsed')) return;
    const sheet = this.sheet;
    if (this.open && !sheet.open) {
      sheet.showModal();
      // The dialog would otherwise focus, and ring, the first control in it
      sheet.querySelector<HTMLElement>('.tray__panel')!.focus();
      lockBodyScrolling(this);
      this.emit('zn-show');
    } else if (!this.open && sheet.open) {
      sheet.close();
      unlockBodyScrolling(this);
      this.emit('zn-close');
    }
  }

  /** Opens the sheet, when collapsed. */
  show() {
    if (this.collapsed) this.open = true;
  }

  /** Closes the sheet. */
  hide() {
    this.open = false;
  }

  private watchMedia() {
    this.media?.removeEventListener('change', this.syncCollapsed);
    this.media = window.matchMedia(`(max-width: ${this.breakpoint}px)`);
    this.media.addEventListener('change', this.syncCollapsed);
    this.syncCollapsed();
  }

  private syncCollapsed = () => {
    this.collapsed = !!this.media?.matches;
  };

  // Escape on a native modal dialog closes it without going through `open`
  private handleCancel = (e: Event) => {
    e.preventDefault();
    this.hide();
  };

  private handleNativeClose = () => {
    this.hide();
  };

  private handleSheetClick = (e: MouseEvent) => {
    if (e.target === this.sheet) this.hide();
  };

  render() {
    return html`
      ${this.collapsed ? html`
        <zn-button class="tray__trigger" part="trigger" panel-bg grow icon="sliders-horizontal@lu" icon-size="16"
                   notification="${this.count || nothing}" muted-notifications aria-haspopup="dialog"
                   aria-expanded="${this.open}" @click="${() => this.show()}">
          <span class="tray__summary">${this.summary || this.label}</span>
        </zn-button>` : html`<slot></slot>`}
      <dialog class="tray__sheet" part="sheet" aria-label="${this.label}"
              @cancel="${this.handleCancel}" @close="${this.handleNativeClose}" @click="${this.handleSheetClick}">
        <div class="tray__panel" tabindex="-1">
          <div class="tray__handle" aria-hidden="true"></div>
          <header class="tray__header" part="header">
            <h2 class="tray__title">${this.label}</h2>
            <slot name="header-actions"></slot>
          </header>
          <div class="tray__body" part="body">${this.collapsed ? html`<slot></slot>` : nothing}</div>
          <footer class="tray__footer" part="footer">
            <zn-button class="tray__done" color="primary" grow @click="${() => this.hide()}">${this.doneLabel}</zn-button>
          </footer>
        </div>
      </dialog>`;
  }
}
