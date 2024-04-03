import { html } from "lit";
import { Meta, StoryObj } from "@storybook/web-components";

import '../../src/ChatSocket';

const meta: Meta = {
  component: 'zn-chat-socket',
  title: 'Components/ChatSocket',
  tags: ['components', 'chat-socket'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: ({ chatFid, chatRef, socketHost, typingMessage, writeAMessage, send, waitingMessage }) =>
  {
    return html`
      <div style="height: 300px">
        <zn-chat-socket chat-fid="${chatFid}" chat-ref="${chatRef}" socket-host="${socketHost}"
                        typing-message="${typingMessage}" write-a-message="${writeAMessage}" send="${send}"
                        waiting-message="${waitingMessage}"></zn-chat-socket>
      </div>`;
  },
  args: {
    chatFid: 'FID:INT:1712149096:C0LFXbHyP82Ie',
    chatRef: 'INT-sbdap4-C0LFXbHyP82Ie-SONqXyfgBpkmk6qdRWEPaiObIUyANt9U',
    socketHost: 'wss://socket.fortifi.me',
    typingMessage: 'Agent Typing',
    writeAMessage: 'Write a message',
    send: 'Send',
    waitingMessage: 'Please wait...',
  }
};
