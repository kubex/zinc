import ZnChatMessageAttachment from './chat-message-attachment.component';

export * from './chat-message-attachment.component';
export default ZnChatMessageAttachment;

ZnChatMessageAttachment.define('zn-chat-message-attachment');

declare global {
  interface HTMLElementTagNameMap {
    'zn-chat-message-attachment': ZnChatMessageAttachment;
  }
}
