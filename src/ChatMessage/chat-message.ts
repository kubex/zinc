import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import styles from './index.scss';
import { cleanHTML } from "./clean-message";
import { unsafeHTML } from "lit/directives/unsafe-html.js";


type ChatMessageActionType = ""
  | 'connected.agent'
  | 'attachment.added'
  | "multi.answer"
  | "transfer"
  | "ended"
  | "note"
  | "error"
  | "message-sending"
  | "customer.ended";


@customElement('zn-chat-message')
export class ChatMessage extends LitElement
{
  static styles = unsafeCSS(styles);

  @property({ type: String }) sender = '';
  @property({ type: String }) message = '';
  @property({ type: String }) time = '';
  @property({ type: String, attribute: 'action-type' }) actionType: ChatMessageActionType = '';
  @property({ type: String }) customerInitiated = "0";

  render()
  {
    if(!this._displayMessage())
    {
      return html``;
    }

    if(this.actionType === "message-sending") {
      return html`
        <div class="wrapper">
          <div class="message sending">
            ${this._prepareMessageContent()}
          </div>
          <div class="int-msg-d">
            Sending...
          </div>
        </div>`;
    }

    if(this.actionType === "note")
    {
      return html`
        <div class="wrapper">
          <div class="message note">
            Note: ${this._prepareMessageContent()}
          </div>
          <div class="int-msg-d">
            ${this._getAuthor()}
            ${this._getTime()}
          </div>
        </div>`;
    }

    if(this.actionType === 'multi.answer')
    {
      return this._displayMultiAnswer();
    }

    return html`
      <div class="wrapper ${this.sender ? 'message-' + this.sender : ''}">
        <div class="message">
          ${this._prepareMessageContent()}
        </div>
        <div class="int-msg-d">
          ${this._getAuthor()}
          ${this._getTime()}
        </div>
      </div>`;
  }

  private _displayMessage()
  {
    const types = ["", 'connected.agent', 'attachment.added', "multi.answer", "transfer", "ended", "error",
      "note", "customer.ended", "message-sending"];
    const type = types.indexOf(this.actionType);

    return type > -1;
  }

  private _getSentTime()
  {
    const time = new Date(parseInt(this.time) * 1000);

    // if not today, show date and time without seconds
    if(time.getDate() !== (new Date()).getDate())
    {
      return `@ ${time.toLocaleDateString()} ${time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    else
    {
      return `@ ${time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  }

  private _displayMultiAnswer()
  {
    return html`
      <div class="wrapper ${this.sender ? 'message-' + this.sender : ''}">
        <div class="message">
          ${this._prepareMessageContent()}
        </div>
        <div class="int-msg-d">
          ${this._getAuthor()}
          ${this._getTime()}
        </div>
      </div>`;
  }

  private _prepareMessageContent()
  {
    let content = cleanHTML(this.message);

    content = content.replace(/(?:\r\n|\r|\n)/g, '<br>');
    content = content.replace(/\b(((https?|ftp|dict):\/\/|www\.)[^'">\s]+\.[^'">\s]+)(?=\s|$)(?!["<>])/g, '<a href="$1" target="_blank">$1</a>');
    content = unsafeHTML(content) as string;
    return content;
  }

  private _getAuthor()
  {
    return html`<span class="int-msg-who">
      ${this.sender !== "" ? this.sender : (this.customerInitiated === "0" ? 'Customer' : 'You')}
    </span>`;
  }

  private _getTime()
  {
    return html`<span class="int-msg-time">
      ${this.time ? this._getSentTime() : null}
    </span>`;
  }
}
