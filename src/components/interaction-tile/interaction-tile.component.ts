import { property } from 'lit/decorators.js';
import { type CSSResultGroup, html, PropertyValues, unsafeCSS } from 'lit';
import ZincElement from '../../internal/zinc-element';

import styles from './interaction-tile.scss';
import { classMap } from "lit/directives/class-map.js";

export enum InteractionType {
  chat = 'chat',
  ticket = 'ticket',
  voice = 'voice',
  unknown = 'unknown'
}

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/interaction-tile
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-example
 *
 * @event zn-event-name - Emitted as an example.
 *
 * @slot - The default slot.
 * @slot example - An example slot.
 *
 * @csspart base - The component's base wrapper.
 *
 * @cssproperty --example - An example CSS custom property.
 */
export default class ZnInteractionTile extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({ type: InteractionType }) type = InteractionType.unknown;
  @property({ attribute: 'interaction-status' }) interactionStatus: string = '';
  @property() status: string = '';

  @property() caption: string = '';
  @property({ attribute: 'last-message' }) lastMessage: string = '';
  @property({ type: Number, attribute: 'last-message-count' }) lastMessageCount: number = 1;

  @property({ type: Number, attribute: 'last-message-time' }) lastMessageTime: number = 0;
  @property({ type: Number, attribute: 'start-time' }) startTime: number = 0;
  @property({ type: Number, attribute: 'reserved-until' }) reservedUntil: number = 0;

  @property() brand: string = '';
  @property({ attribute: 'brand-icon' }) brandIcon: string = '';

  @property() department: string = '';
  @property() queue: string = '';

  @property({ attribute: 'accept-uri' }) acceptUri: string = '';

  private _updateInterval: any;

  protected firstUpdated(_changedProperties: PropertyValues) {
    this._startInterval();
    super.firstUpdated(_changedProperties);
  }

  protected _getInteractionColor() {
    if (this.interactionStatus === 'ended' || this.interactionStatus === 'resolved') {
      return 'disabled';
    }

    if (this.interactionStatus === 'waiting-response') {
      const diff = this._getWaitingResponseTime();
      const minutes = Math.floor((diff / (1000 * 60)) % 60);

      if (minutes >= 1 && minutes < 5) {
        return 'warning';
      }

      if (minutes > 5) {
        return 'error';
      }
    }

    return 'primary';
  }

  protected _getInteractionIcon() {
    switch (this.type) {
      case InteractionType.ticket:
        return html`
          <zn-icon color="${this._getInteractionColor()}" src="mail"></zn-icon>`;
      case InteractionType.chat:
        return html`
          <zn-icon color="${this._getInteractionColor()}" src="chat"></zn-icon>`;
      case InteractionType.voice:
        return html`
          <zn-icon color="${this._getInteractionColor()}" src="support_agent"></zn-icon>`;
      default:
        return html`
          <zn-icon color="${this._getInteractionColor()}" src="contact_support"></zn-icon>`;
    }
  }

  disconnectedCallback() {
    this._clearStartInterval(); // Always clear interval when component is removed
    super.disconnectedCallback();
  }

  protected _getStartTime() {
    if (!this.startTime) return '';
    const date = new Date(this.startTime * 1000);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
  }

  protected _getStatusBar() {
    const icon = this._getInteractionIcon();
    const start = this._getStartTime();

    return html`
      <div class="interaction-tile__status-bar">
        <p>${start}</p>
        ${icon}
      </div>`;
  }

  protected _getDepartmentAndQueue() {
    return html`<p>${this.department} ${this.queue ? ' : ' + this.queue : ''}</p>`;
  }

  protected _getWaitingResponseTime() {
    let lastMessageTime = this.lastMessageTime;
    if (lastMessageTime.toString().length == 10) lastMessageTime = lastMessageTime * 1000;

    const now = Date.now();
    return now - lastMessageTime; // return diff
  }

  protected _startInterval() {
    if (this._updateInterval !== undefined) return;
    this._updateInterval = setInterval(() => this.requestUpdate(), 500);
  }

  protected _clearStartInterval() {
    if (this._updateInterval !== undefined) {
      clearInterval(this._updateInterval);
      this._updateInterval = undefined;
    }
  }

  protected _waitingResponseContent() {
    if (this.interactionStatus !== 'waiting-response') return;

    const diff = this._getWaitingResponseTime();
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    let time = html``;
    if (minutes > 60) {
      time = html`<p>Overdue</p>`;
    } else if (minutes > 0 || seconds > 30) {
      time = html`<p>${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}</p>`;
    }

    return html`
      <div class="interaction-tile__status__waiting-response">
        ${time}
        <div class="waiting-response-bg">
          <p>${this.lastMessageCount}</p>
        </div>
      </div>`;
  }

  protected render(): unknown {
    const color = this._getInteractionColor();

    let right = html`
      ${this._getStatusBar()}
      <div class="interaction-tile__status">
        ${this._waitingResponseContent()}
      </div>`;

    if (this.acceptUri) {
      right = html`
        ${this._getAcceptButton()}`;
    }

    if (this.interactionStatus === 'ended' || this.interactionStatus === 'resolved') {
      right = html`
        ${this._getStatusBar()}
        <div class="interaction-tile__status">
          <div class="interaction-tile__status__ended">
            <zn-icon color="white" src="redeem" size="16"></zn-icon>
          </div>
        </div>
      `;
    }

    const reservedHtml = this._getReservedHtml();

    const brand = this._getBrandHtml();

    return html`
      <div
        class=${classMap({
          'interaction-tile': true,
          'interaction-tile--primary': color === 'primary',
          'interaction-tile--warning': color === 'warning',
          'interaction-tile--error': color === 'error',
          'interaction-tile--disabled': color === 'disabled'
        })}>
        ${reservedHtml}
        <div class="interaction-tile__body">
          <div class="interaction-tile__body--left">
            <h3>${this._maskCaption(this.caption)}</h3>
            <p>${this._maskCaption(this.lastMessage)}</p>
          </div>
          <div class="interaction-tile__body--right">
            ${right}
          </div>
        </div>
        <div class="interaction-tile__footer">
          <div class="interaction-tile__branding">
            ${brand}
          </div>
          <div class="interaction-tile__queue">${this._getDepartmentAndQueue()}</div>
        </div>
      </div>`;
  }

  protected _getAcceptButton() {
    return html` <a href="${this.acceptUri}">
      <zn-button icon="${this._getInteractionAcceptIcon()}" icon-size="28"></zn-button>
    </a>`;
  }

  protected _getInteractionAcceptIcon() {
    switch (this.type) {
      case InteractionType.ticket:
        return 'mail';
      case InteractionType.chat:
        return 'chat';
      case InteractionType.voice:
        return 'call';
      default:
        return 'support_agent';
    }
  }

  protected _getReservedHtml() {
    if (this.status !== 'queued' || !this.reservedUntil) return;
    if (this.reservedUntil.toString().length == 10) this.reservedUntil = this.reservedUntil * 1000;

    const now = Date.now();
    const diff = this.reservedUntil - now;
    const seconds = Math.floor((diff / 1000) % 60);

    if (seconds <= 0) return;

    this._startInterval();

    return html`<p class="interaction-tile__reserved">Reserved for ${seconds} seconds</p>`;
  }

  protected _getBrandHtml() {
    if (!this.brand && !this.brandIcon) return;

    return html`${this.brandIcon ? html`
      <div class="interaction-tile__branding__icon"
           style="background-image: url(${"" + this.brandIcon})"></div>` : ''}
    <p>${this.brand}</p>`;
  }

  protected _maskCaption(str: string) {
    let masked = str.replace(/\+?(\d{2,4})\s?(\d{2,4})\s?(\d{2,4})\s?(\d{2,4})/, "$1******");
    // mask email
    masked = masked.replace(/([a-zA-Z0-9.+_-]+@([a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+))/, "*****@$2");
    return masked;
  }
}
