import ZnChatMessage from './chat-message.component';

export * from './chat-message.component';
export default ZnChatMessage;

ZnChatMessage.define('zn-chat-message');

declare global {
  interface HTMLElementTagNameMap {
    'zn-chat-message': ZnChatMessage;
  }
}
