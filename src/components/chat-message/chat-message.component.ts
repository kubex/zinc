import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property} from "lit/decorators.js";
import ZincElement from '../../internal/zinc-element';
import ZnIcon from "../icon";

import styles from './chat-message.scss';

/**
 * @summary A single message in a chat-style conversation: avatar, sender,
 * time, optional badge, and a message bubble with optional actions.
 * @documentation https://zinc.style/components/chat-message
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-icon
 *
 * @slot - The message content.
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
 *
 * @cssproperty --message-background - The bubble's background colour.
 */
export default class ZnChatMessage extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-icon': ZnIcon
  };

  /** The sender's name, also used for the avatar initials. */
  @property() sender: string = '';

  /** Unix timestamp (seconds) of the message, shown as HH:MM. */
  @property() time: string = '';

  private getTime(time: string) {
    const date = new Date(parseInt(time, 10) * 1000);
    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  }

  protected render() {
    return html`
      <div part="base" class="message">
        <div part="avatar" class="message__avatar">
          <zn-icon library="avatar" src="${this.sender}" size="36" round></zn-icon>
        </div>
        <div part="body" class="message__body">
          <div part="header" class="message__header">
            <span class="message__sender">${this.sender}</span>
            ${this.time ? html`<span class="message__time">${this.getTime(this.time)}</span>` : null}
            <slot name="badge"></slot>
          </div>
          <div part="bubble" class="message__bubble">
            <div part="content" class="message__content">
              <slot></slot>
            </div>
            <div class="message__actions">
              <slot name="edit-dialog-trigger"></slot>
            </div>
          </div>
        </div>
      </div>
      <slot name="edit-dialog"></slot>
    `;
  }
}
