import { html } from "lit";
import { Meta, StoryObj } from "@storybook/web-components";

import '../../src/Header';
import '../../src/Panel';
import '../../src/Timer';
import '../../src/Editor';

const meta: Meta = {
  title: 'Screens/ChatPanel',
  tags: ['screens', 'chat-panel']
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () =>
  {
    return html`
      <zn-pane>

        <zn-header caption="Panel Header">
          Total Time:
          <zn-timer timestamp="2312443423" type="error"></zn-timer>
        </zn-header>

        <zn-chat-message-window>
          <zn-chat-message customer-initiated="1" sender="pubsocket" time="123123213">
            I'd like to talk about something
          </zn-chat-message>
          <zn-chat-message sender="you" time="123123213">
            What would you like to talk about?
          </zn-chat-message>
        </zn-chat-message-window>

        <zn-chat-response-window>
          <zn-editor></zn-editor>
        </zn-chat-response-window>
      </zn-pane>`;
  },
};
