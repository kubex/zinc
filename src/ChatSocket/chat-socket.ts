import { PubSocket as root } from 'pubsocket-js/src/pubsocket';
import { html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { checkText } from 'smile2emoji';

import styles from './index.scss';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
declare type Message = any;

@customElement('zn-chat-socket')
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export class ChatSocket extends root
{
  static styles = [root.styles, unsafeCSS(styles)];
  @property({ attribute: 'typing-message', type: String })
  public typingMessageText: string = "Agent Typing";

  @property({ attribute: 'write-a-message', type: String })
  public writeMessageText: string = "Write a message...";

  @property({ attribute: 'send', type: String })
  public sendText: string = "Send";

  @property({ attribute: 'waiting-message', type: String })
  public waitingMessage: string = "Waiting for an Agent to connect";

  protected render(): unknown
  {

    let ul = html`
      <ul>
        ${this._messages.map(this.renderMessage.bind(this))}
      </ul>`;

    if(this._messages.length <= 0)
    {
      ul = html`
        <div id="no-messages">${this.waitingMessage}</div>`;
    }

    return html`
      ${ul}
      ${this._agentTyping ? html`
        <div id="agent-typing">${this.typingMessageText}</div>` : null}
      ${this.hideSendPanel ? null : html`
        <div id="send-panel">
          <input id="msg" @keypress=${this._inputKeyDown} ?disabled=${!this.canReply}
                 placeholder="${this.writeMessageText}">
          <button @click="${this._send}">${this.sendText}</button>
        </div>`
      }
    `;
  }

  protected escapeSpecialChars(regex)
  {
    return regex.replace(/([()[{*+.$^\\|?])/g, '\\$1');
  }

  protected renderMessage(msg: Message, index: number): unknown
  {
    if(!this.displayMessage(msg))
    {
      return html``;
    }

    let actionType = msg.actionType;
    if(actionType === 'connected.agent')
    {
      const name = document.getElementById('livechat-header');
      if(name)
      {
        name.innerText = msg.content;
      }
    }

    if(msg.actionType === 'multi.answer')
    {
      return this._htmlMultiAnswer(index, msg);
    }

    if(actionType == "")
    {
      actionType = "chat";
    }

    return html`
      <li ?customer="${msg.customerInitiated}" ?undelivered="${msg.undelivered}" action-type="${actionType}">
        <span class="int-msg">
          ${this._prepareMessageContent(msg.content)}
        </span>
        <div class="int-msg-d">
          ${this._htmlAuthor(msg.author, msg.customerInitiated)}
          ${this._htmlTime(msg.time)}
        </div>
      </li>`;
  }

  _htmlMultiAnswer(index: number, msg: Message)
  {
    const payload = JSON.parse(msg.content);

    let answers = html``;
    let canReply = true;

    if(index === this._messages.length - 1)
    {
      canReply = false;
      answers = this._htmlAnswers(payload.answers);
    }

    this.dispatchEvent(new CustomEvent('can.reply', { detail: canReply }));

    return html`
      <li ?customer="${msg.customerInitiated}" ?undelivered="${msg.undelivered}" action-type="${msg.actionType}">
        <span class="int-msg">
          ${this._prepareMessageContent(payload.message)}
        </span>
        <div class="int-msg-d">
          ${this._htmlAuthor(msg.author, msg.customerInitiated)}
          ${this._htmlTime(msg.time)}
        </div>
      </li>
      ${answers}`;
  }

  _prepareMessageContent(content: string)
  {
    content = this.cleanHtml(content);

    content = content.replace(/(\r\n|\r|\n)/g, '<br>');
    content = content.replace(/\b(((https?|ftp|dict):\/\/|www\.)[^'">\s]+\.[^'">\s]+)(?=\s|$)(?!["<>])/g, '<a href="$1" target="_blank">$1</a>');
    content = checkText(content);
    content = unsafeHTML(content) as string;

    return content;
  }

  cleanHtml(content: string)
  {
    function stringToHTML(content: string): HTMLElement
    {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      return doc.body;
    }

    function removeScripts(html: HTMLElement)
    {
      const scripts = html.querySelectorAll('script');
      scripts.forEach((script) =>
      {
        script.remove();
      });
    }

    function isPossiblyDangerousAttribute(name: string, value: string)
    {
      if(['src', 'href', 'xlink:href'].includes(name))
      {
        if(value.includes('javascript:') || value.includes('data:text/html')) return true;
      }

      if(name.startsWith('on')) return true;
    }

    function removeAttributes(elem)
    {
      const attributes = elem.attributes;
      for(let i = attributes.length - 1; i >= 0; i--)
      {
        if(isPossiblyDangerousAttribute(attributes[i].name, attributes[i].value))
        {
          elem.removeAttributeNode(attributes[i]);
        }
      }
    }

    function clean(html: HTMLElement)
    {
      const nodes = html.children;
      for(let i = nodes.length - 1; i >= 0; i--)
      {
        const node = nodes[i] as HTMLElement;
        removeAttributes(node);
        clean(node);
      }
    }

    const html = stringToHTML(content);
    removeScripts(html);
    clean(html);
    return html.innerHTML;
  }

  _htmlAuthor(author: string, customerInitiated: boolean)
  {
    return html`<span class="int-msg-who">
          ${author !== "" ? author : (customerInitiated ? 'You' : 'Agent')}
        </span>`;
  }
}

