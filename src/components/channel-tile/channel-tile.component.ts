import { classMap } from 'lit/directives/class-map.js';
import { type CSSResultGroup, html, type PropertyValues, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';

import styles from './channel-tile.scss';

export type ChannelTileColor =
  'default' | 'primary' | 'info' | 'success' | 'warning' | 'error' | 'disabled';

/**
 * @summary A channel/queue slot tile with two faces: an active (occupied) state
 * showing an in-progress item, and an available (empty) state advertising
 * capacity — optionally reserving an incoming item with an auto-accept countdown.
 * @documentation https://zinc.style/components/channel-tile
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-button
 * @dependency zn-icon
 *
 * @event zn-accept - Emitted when an available tile is accepted (click or auto-accept).
 *  Cancelable — call `preventDefault()` to suppress the built-in `accept-uri` fetch.
 * @event zn-reject - Emitted when the reject control is pressed.
 *
 * @slot title - Replaces the primary line. Falls back to the `title` attribute (or "Available" when unset in the available state).
 * @slot subtitle - Replaces the secondary line. Falls back to the `subtitle` attribute.
 * @slot leading - Replaces the leading icon in the active state.
 * @slot action - Action content for the available state (e.g. a form). Falls back to a default accept button.
 * @slot footer - Trailing content (e.g. status badges) in the active state.
 *
 * @csspart base - The component's base wrapper.
 * @csspart progress - The progress indicator (incoming countdown overlay or active progress bar).
 *
 * @cssproperty --channel-tile-color - Resolved accent color (set from the `color` property).
 */
export default class ZnChannelTile extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  /** Renders the empty/available face instead of the active face. */
  @property({ type: Boolean, reflect: true }) available: boolean = false;

  /** (Available only) the tile is reserving an incoming item awaiting acceptance. */
  @property({ type: Boolean, reflect: true }) incoming: boolean = false;

  /** Free-form grouping/theming key (reflected so consumers can query/style by it). */
  @property({ reflect: true }) variant: string = '';

  /** Top-bar text (e.g. brand). */
  @property() header: string = '';

  /** Leading icon (active state). */
  @property() icon: string = '';

  /** Accent color driving the leading icon and `--channel-tile-color`. */
  @property({ reflect: true }) color: ChannelTileColor = 'default';

  /** Primary line. Defaults to "Available" in the available state when unset. */
  @property() title: string = '';

  /** Secondary line. */
  @property() subtitle: string = '';

  /** (Active only) progress bar fill, 0–100. */
  @property({ type: Number }) progress: number = 0;

  /** (Active only) CSS color for the progress bar fill. */
  @property({ attribute: 'progress-color' }) progressColor: string = '';

  /** Identifier carried in `zn-accept` / `zn-reject` event details. */
  @property({ attribute: 'item-id' }) itemId: string = '';

  /** (Available only) when set, accepting fetches this URI unless `zn-accept` is canceled. */
  @property({ attribute: 'accept-uri' }) acceptUri: string = '';

  /** (Available/incoming) epoch (seconds or millis) at which the reservation window ends. */
  @property({ type: Number, attribute: 'reserved-until' }) reservedUntil: number = 0;

  /** (Available/incoming) auto-accept window length in milliseconds. */
  @property({ type: Number, attribute: 'auto-accept-delay' }) autoAcceptDelay: number = 0;

  /** (Available/incoming) whether a reject control is offered. */
  @property({ type: Boolean, reflect: true }) rejectable: boolean = false;

  /** Icon for the built-in accept button. */
  @property({ attribute: 'accept-icon' }) acceptIcon: string = 'plus@lu';

  /** Optional analytics id forwarded to the built-in accept button. */
  @property({ attribute: 'accept-gaid' }) acceptGaid: string = '';

  /** Icon for the reject control. */
  @property({ attribute: 'reject-icon' }) rejectIcon: string = 'close';

  /** Accessible label for the reject control. */
  @property({ attribute: 'reject-label' }) rejectLabel: string = 'Reject';

  private _tickInterval: number | undefined;
  private _autoAcceptFired: string = '';

  protected firstUpdated(changed: PropertyValues) {
    super.firstUpdated(changed);
    this._startTicker();
  }

  disconnectedCallback() {
    this._stopTicker();
    super.disconnectedCallback();
  }

  protected updated(changed: PropertyValues) {
    super.updated(changed);
    if (changed.has('itemId') && this.itemId !== this._autoAcceptFired) {
      this._autoAcceptFired = '';
    }
  }

  private _isCountingDown(): boolean {
    return this.available && this.incoming;
  }

  private _startTicker() {
    if (this._tickInterval !== undefined) return;
    this._tickInterval = window.setInterval(() => {
      // Only the incoming countdown needs a self-driven re-render; active
      // tiles are refreshed by the consumer setting `progress`/`color`.
      if (!this._isCountingDown()) return;
      this.requestUpdate();
      this._maybeAutoAccept();
    }, 200);
  }

  private _stopTicker() {
    if (this._tickInterval !== undefined) {
      clearInterval(this._tickInterval);
      this._tickInterval = undefined;
    }
  }

  private _maybeAutoAccept() {
    if (!this._isCountingDown()) return;
    if (!this.acceptUri) return;
    if (!this.autoAcceptDelay || !this.reservedUntil) return;
    if (this._autoAcceptFired === this.itemId) return;

    const until = this._reservedUntilMs();
    if (!until || Date.now() < until) return;

    this._autoAcceptFired = this.itemId;
    this._accept();
  }

  private _accept(): void {
    const event = this.emit('zn-accept', {
      cancelable: true,
      detail: { itemId: this.itemId, acceptUri: this.acceptUri },
    });
    if (event.defaultPrevented || !this.acceptUri) return;
    fetch(this.acceptUri, { credentials: 'same-origin' }).catch((err) => {
      console.error('Error accepting interaction', err);
    });
  }

  private _reservedUntilMs(): number {
    if (!this.reservedUntil) return 0;
    return this.reservedUntil.toString().length === 10
      ? this.reservedUntil * 1000
      : this.reservedUntil;
  }

  private _countdownPercent(): number {
    const until = this._reservedUntilMs();
    if (!until || !this.autoAcceptDelay) return 0;
    const total = this.autoAcceptDelay;
    const remaining = Math.max(0, until - Date.now());
    const elapsed = Math.max(0, total - remaining);
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  }

  private _remainingSeconds(): number | null {
    // Only surfaced for auto-accept countdowns, not plain reservation windows.
    const until = this._reservedUntilMs();
    if (!until || !this.autoAcceptDelay) return null;
    return Math.max(0, Math.ceil((until - Date.now()) / 1000));
  }

  private _handleReject = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    this.emit('zn-reject', { detail: { itemId: this.itemId, variant: this.variant } });
  };

  private _handleClick = (e: MouseEvent) => {
    if (!this._isCountingDown() || !this.acceptUri) return;
    if (e.defaultPrevented) return;
    e.preventDefault();
    e.stopPropagation();
    this._accept();
  };

  protected render(): unknown {
    const title = this.title || (this.available ? 'Available' : '');
    const countdown = this._isCountingDown() ? this._countdownPercent() : null;
    const remaining = this._isCountingDown() ? this._remainingSeconds() : null;

    return html`
      <div
        part="base"
        class=${classMap({
          'channel-tile': true,
          'channel-tile--available': this.available,
          'channel-tile--active': !this.available,
          'channel-tile--incoming': this.available && this.incoming,
          [`channel-tile--${this.color}`]: true,
        })}
        role="button"
        tabindex="0"
        @click=${this._handleClick}>
        <div class="channel-tile__header">${this.header ? html`<h3>${this.header}</h3>` : ''}</div>
        ${countdown !== null
          ? html`
            <div part="progress" class="channel-tile__overlay" style="width: ${countdown}%"></div>`
          : ''}
        <div class="channel-tile__body">
          ${this._renderLeading()}
          <div class="channel-tile__content">
            ${remaining !== null
              ? this.title
                ? html`
                  <h3 class="channel-tile__title">
                    <slot name="title">${this.title}</slot>
                  </h3>
                  <p class="channel-tile__subtitle">${this.subtitle} (${remaining}s)</p>`
                : html`
                  <h3 class="channel-tile__title">${this.subtitle} (${remaining}s)</h3>`
              : html`
                <h3 class="channel-tile__title">
                  <slot name="title">${title}</slot>
                </h3>
                <p class="channel-tile__subtitle">
                  <slot name="subtitle">${this.subtitle}</slot>
                </p>`}
          </div>
          <slot name="footer" class="channel-tile__footer"></slot>
        </div>
        ${!this.available
          ? html`
            <div part="progress" class="channel-tile__bar">
              <div class="channel-tile__bar-fill"
                   style="width: ${this.progress}%; background-color: ${this.progressColor || 'transparent'};"></div>
            </div>`
          : ''}
      </div>`;
  }

  private _renderLeading() {
    if (this.available) {
      return this._renderAvailableAction();
    }

    return html`
      <slot name="leading">
        ${this.icon
          ? html`
            <zn-button icon=${this.icon}
                       icon-size="20"
                       icon-button="round"
                       color=${this.color}
                       no-hover></zn-button>`
          : ''}
      </slot>`;
  }

  private _renderAvailableAction() {
    if (this.incoming && this.rejectable) {
      return html`
        <button class="channel-tile__reject" type="button" aria-label=${this.rejectLabel}
                @click=${this._handleReject}>
          <zn-icon src=${this.rejectIcon} size="22"></zn-icon>
        </button>`;
    }

    if (this.acceptUri) {
      return html`
        <zn-button href=${this.acceptUri}
                   icon=${this.acceptIcon}
                   icon-size="20"
                   icon-button="round"
                   gaid=${this.acceptGaid}
                   loading-text="Accepting"
                   no-hover>
        </zn-button>`;
    }

    return html`
      <slot name="action">
        <zn-button icon=${this.acceptIcon}
                   icon-size="20"
                   icon-button="round"
                   gaid=${this.acceptGaid}
                   no-hover>
        </zn-button>
      </slot>`;
  }
}
