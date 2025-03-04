import { property } from 'lit/decorators.js';
import { type CSSResultGroup, html, unsafeCSS } from 'lit';
import ZincElement from '../../internal/zinc-element';

import styles from './chat-message.scss';
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { cleanHTML } from "./clean-message";

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/chat-message
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
export default class ZnChatMessage extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({ type: String }) sender = '';
  @property({ type: String }) message = '';
  @property({ type: String }) time = '';
  @property({ type: String, attribute: 'action-type' }) actionType: '' | 'connected.agent' | 'attachment.added' |
    'multi.answer' | 'transfer' | 'ended' | "error" | 'message-sending' | 'customer.ended' |
    'customer.connected' | 'customer.disconnected' = '';

  @property({ type: String, reflect: true, attribute: 'customer-initiated' }) customerInitiated = "0";

  connectedCallback() {
    let agentInitiated = false;
    let customerInitiated = false;

    if (!this.actionType) {
      if (this.customerInitiated === "false" || this.customerInitiated === "0" || !this.customerInitiated) {
        this?.classList?.add('agent-initiated');
        agentInitiated = true;
      } else {
        this?.classList?.add('customer-initiated');
        customerInitiated = true;
      }
    }

    const previous = this.previousElementSibling as ZnChatMessage;
    const inTime = parseInt(this.time) - parseInt(previous?.time);

    if (previous && inTime < 60 &&
      ((previous?.classList.contains('agent-initiated') && agentInitiated) ||
        (previous?.classList.contains('customer-initiated') && customerInitiated))) {
      this.classList.add('message-continued');
    }

    super.connectedCallback();
  }

  render() {
    if (!this._displayMessage()) {
      return html``;
    }

    if (this.actionType === "message-sending") {
      return html`
        <div class="wrapper">
          <div class="message sending">
            ${this._prepareMessageContent()}
            <div class="int-msg-d">
              Sending...
            </div>
          </div>
        </div>`;
    }

    if (this.actionType === 'multi.answer') {
      return this._displayMultiAnswer();
    }

    return html`
      <div class="wrapper ${this.sender ? 'message-' + this.sender : ''}">
        <div class="message">
          ${this._getAuthor()}
          ${this._prepareMessageContent()}
          <div class="int-msg-d">
            ${this._getTime()}
          </div>
        </div>
      </div>`;
  }

  private _displayMessage() {
    const types = ["", 'connected.agent', 'attachment.added', "multi.answer", "transfer", "ended", "error",
      "customer.ended", "message-sending", "customer.connected", "customer.disconnected"];
    const type = types.indexOf(this.actionType);

    return type > -1;
  }

  private _getSentTime() {
    const time = new Date(parseInt(this.time) * 1000);

    // if not today, show date and time without seconds
    if (time.getDate() !== (new Date()).getDate()) {
      return `${time.toLocaleDateString()} ${time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return `${time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  }

  private _displayMultiAnswer() {
    return html`
      <div class="wrapper ${this.sender ? 'message-' + this.sender : ''}">
        <div class="message">
          ${this._getAuthor()}
          ${this._prepareMessageContent()}
          <div class="int-msg-d">
            ${this._getTime()}
          </div>
        </div>
      </div>`;
  }

  private _prepareMessageContent() {
    let content = cleanHTML(this.message);

    content = content.replace(/\r\n|\r|\n/g, '<br>');
    content = content.replace(/\b(((https?|ftp|dict):\/\/|www\.)[^'">\s]+\.[^'">\s]+)(?=\s|$)(?!["<>])/g, '<a href="$1" target="_blank">$1</a>');
    content = unsafeHTML(content) as string;
    return content;
  }

  private _getAuthor() {
    return html`<span class="int-msg-who">
      ${this.sender !== "" ? this.sender : (this.customerInitiated === "1" ? 'Customer' : 'You')}
    </span>`;
  }

  private _getTime() {
    return html`<span class="int-msg-time">
      ${this.time ? this._getSentTime() : null}
    </span>`;
  }
}
