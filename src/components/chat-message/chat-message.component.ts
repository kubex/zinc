import {cleanHTML} from "./clean-message";
import {type CSSResultGroup, html, nothing, unsafeCSS} from 'lit';
import {property} from "lit/decorators.js";
import {unsafeHTML} from "lit/directives/unsafe-html.js";
import ZincElement from '../../internal/zinc-element';
import ZnIcon from "../icon";

import styles from './chat-message.scss';

export type ChatMessageActionType = '' | 'connected.agent' | 'attachment.added' | 'multi.answer' | 'transfer' |
  'ended' | 'error' | 'message-sending' | 'customer.ended' | 'customer.connected' | 'customer.disconnected' |
  'internal';

/**
 * @summary A single message in a chat-style conversation: avatar, sender,
 * time, optional badge, and a message bubble with optional actions. Also renders
 * system events (connections, transfers, etc.) as a centred card.
 * @documentation https://zinc.style/components/chat-message
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-icon
 *
 * @slot - The message content. Ignored when the `message` attribute is set.
 * @slot badge - Rendered in the header after the sender and time (e.g. an INTERNAL NOTE chip).
 * @slot edit-dialog-trigger - Action rendered at the end of the bubble (e.g. a remove icon button).
 * @slot edit-dialog - Pass-through for an associated dialog element.
 *
 * @csspart base - The component's base wrapper.
 * @csspart avatar - The avatar column.
 * @csspart body - The header and bubble column.
 * @csspart header - The sender/time/badge row.
 * @csspart bubble - The message bubble.
 * @csspart content - The message content within the bubble.
 * @csspart system-card - The card rendered for system action types.
 *
 * @cssproperty --message-background - The bubble's background colour.
 */
export default class ZnChatMessage extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-icon': ZnIcon
  };

  static readonly SYSTEM_ACTION_TYPES: readonly string[] = [
    'connected.agent', 'attachment.added', 'transfer', 'ended',
    'customer.ended', 'customer.connected', 'customer.disconnected',
  ];

  private static readonly DISPLAYED_ACTION_TYPES: readonly string[] = [
    '', 'connected.agent', 'attachment.added', 'multi.answer', 'transfer', 'ended', 'error',
    'customer.ended', 'message-sending', 'customer.connected', 'customer.disconnected', 'internal',
  ];

  /** The sender's name, also used for the avatar. */
  @property() sender: string = '';

  /**
   * The message body as an HTML string. When set, it is sanitized (scripts and event
   * handlers stripped), newlines become line breaks and bare URLs become links. When
   * omitted the default slot is rendered instead.
   */
  @property() message: string = '';

  /** Unix timestamp (seconds) of the message, shown as HH:MM (with date if not today). */
  @property() time: string = '';

  /** Overrides the avatar source. Defaults to `sender`. */
  @property() avatar: string = '';

  /** The kind of message. Drives system-card rendering, the sending state and badges. */
  @property({attribute: 'action-type', reflect: true}) actionType: ChatMessageActionType = '';

  /** Marks the message as initiated by the customer (affects styling and grouping). */
  @property({type: Boolean, reflect: true, attribute: 'customer-initiated'}) customerInitiated = false;

  /** Marks the message as initiated by an agent (affects styling and grouping). */
  @property({type: Boolean, reflect: true, attribute: 'agent-initiated'}) agentInitiated = false;

  connectedCallback() {
    const isContent = !this.actionType || this.actionType === 'internal';
    const agentInitiated = isContent && this.agentInitiated;
    const customerInitiated = isContent && this.customerInitiated;

    const previous = this.previousElementSibling as ZnChatMessage;
    const inTime = parseInt(this.time) - parseInt(previous?.time);
    const previousActionType = previous?.getAttribute('action-type') ?? '';
    const previousIsSystem = ZnChatMessage.SYSTEM_ACTION_TYPES.includes(previousActionType);
    const previousIsInternal = previousActionType === 'internal';
    const thisIsInternal = this.actionType === 'internal';

    if (previous && !previousIsSystem && inTime < 60 && previousIsInternal === thisIsInternal &&
      ((previous?.hasAttribute('agent-initiated') && agentInitiated) ||
        (previous?.hasAttribute('customer-initiated') && customerInitiated))) {
      this.classList.add('message-continued');
    }

    super.connectedCallback();
  }

  protected render() {
    if (!ZnChatMessage.DISPLAYED_ACTION_TYPES.includes(this.actionType)) {
      return nothing;
    }

    if (this.isSystemMessage()) {
      return this.renderSystemCard();
    }

    const sending = this.actionType === 'message-sending';

    return html`
      <div part="base" class="message">
        <div part="avatar" class="message__avatar">
          <zn-icon library="avatar" src="${this.avatar || this.sender}" size="36" round></zn-icon>
        </div>
        <div part="body" class="message__body">
          ${sending ? null : this.renderHeader()}
          <div part="bubble" class="message__bubble ${sending ? 'message__bubble--sending' : ''}">
            <div part="content" class="message__content">${this.renderContent()}</div>
            ${sending ? html`<div class="message__meta">Sending...</div>` : html`
              <div class="message__actions">
                <slot name="edit-dialog-trigger"></slot>
              </div>`}
          </div>
        </div>
      </div>
      <slot name="edit-dialog"></slot>
    `;
  }

  private isSystemMessage() {
    return ZnChatMessage.SYSTEM_ACTION_TYPES.includes(this.actionType);
  }

  private renderSystemCard() {
    return html`
      <div part="base" class="message message--system">
        <div part="avatar" class="message__avatar"></div>
        <div part="body" class="message__body">
          <div part="system-card" class="system-card">
            <span class="system-card__text">${this.message || this.systemLabel()}</span>
            ${this.time ? html`<span class="system-card__time">${this.getTime()}</span>` : nothing}
          </div>
        </div>
      </div>`;
  }

  private systemLabel() {
    switch (this.actionType) {
      case 'customer.connected':
        return 'Customer connected';
      case 'customer.disconnected':
        return 'Customer disconnected';
      case 'connected.agent':
        return 'Agent connected';
      case 'transfer':
        return 'Transferred';
      case 'attachment.added':
        return 'Attachment added';
      case 'ended':
        return 'Ended';
      case 'customer.ended':
        return 'Customer ended';
      default:
        return '';
    }
  }

  private renderHeader() {
    return html`
      <div part="header" class="message__header">
        <span class="message__sender">${this.sender || (this.customerInitiated ? 'Customer' : 'You')}</span>
        ${this.time ? html`<span class="message__time">${this.getSentTime()}</span>` : nothing}
        ${this.actionType === 'internal' ? html`<span class="message__badge">INTERNAL</span>` : nothing}
        <slot name="badge"></slot>
      </div>`;
  }

  private renderContent() {
    if (!this.message) {
      return html`<slot></slot>`;
    }

    let content = cleanHTML(this.message);
    content = content.replace(/\r\n|\r|\n/g, '<br>');
    content = content.replace(/\b(((https?|ftp|dict):\/\/|www\.)[^'">\s]+\.[^'">\s]+)(?=\s|$)(?!["<>])/g,
      '<a href="$1" target="_blank">$1</a>');
    return unsafeHTML(content);
  }

  /** HH:MM only — used on the system card. */
  private getTime() {
    const date = new Date(parseInt(this.time, 10) * 1000);
    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  }

  /** HH:MM, prefixed with the date when the message is not from today. */
  private getSentTime() {
    const time = new Date(parseInt(this.time, 10) * 1000);
    const hm = time.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    if (time.getDate() !== (new Date()).getDate()) {
      return `${time.toLocaleDateString()} ${hm}`;
    }
    return hm;
  }
}
