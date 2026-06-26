import {type CSSResultGroup, html, nothing, unsafeCSS} from 'lit';
import {property} from "lit/decorators.js";
import ZincElement from '../../internal/zinc-element';
import ZnIcon from "../icon";

import styles from './chat-message-attachment.scss';

/**
 * @summary A single file or link attachment for a `zn-chat-message`. Renders an
 * icon and a label as a link, styled to match the message's attachments row. It is
 * intended to be used only inside a `zn-chat-message` and is automatically placed in
 * that component's `attachments` slot.
 * @documentation https://zinc.style/components/chat-message-attachment
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-icon
 *
 * @slot - The attachment label. Falls back to the `name` attribute when empty.
 *
 * @csspart base - The attachment link.
 * @csspart icon - The leading icon.
 * @csspart label - The attachment label.
 */
export default class ZnChatMessageAttachment extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-icon': ZnIcon
  };

  /** The URL the attachment links to. */
  @property() href: string = '';

  /** The attachment label (e.g. the file name). Used when the default slot is empty. */
  @property() name: string = '';

  /** The leading icon name. */
  @property() icon: string = 'attach_file';

  /** Where to open the link. Defaults to a new tab. */
  @property() target: string = '_blank';

  /** Prompt a download rather than navigating to the link. */
  @property({type: Boolean}) download = false;

  connectedCallback() {
    super.connectedCallback();

    if (this.closest('zn-chat-message')) {
      if (!this.slot) {
        this.slot = 'attachments';
      }
    } else {
      console.warn('<zn-chat-message-attachment> can only be used inside a <zn-chat-message>.', this);
    }
  }

  protected render() {
    const newTab = this.target === '_blank';

    return html`
      <a
        part="base"
        class="attachment"
        href=${this.href || '#'}
        target=${this.target || nothing}
        rel=${newTab ? 'noreferrer noopener' : nothing}
        ?download=${this.download}
      >
        ${this.icon ? html`
          <zn-icon part="icon" class="paperclip@lu" src=${this.icon} size="20"></zn-icon>` : nothing}
        <span part="label" class="attachment__label"><slot>${this.name}</slot></span>
      </a>
    `;
  }
}
