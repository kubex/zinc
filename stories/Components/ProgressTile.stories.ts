import {html} from "lit";
import {Meta, StoryObj} from "@storybook/web-components";

import '../../src/Panel';
import '../../src/ProgressTile';
import '../../src/Chip';
import '../../src/Icon';

const meta: Meta = {
  title: 'Components/ProgressTile',
  tags: ['components', 'progress-tile']
};

export default meta;
type Story = StoryObj;

const now = Math.round(Date.now() / 1000);

export const Default: Story = {
  render: ({caption}) =>
  {
    return html`
      <zn-panel caption="${caption}">
        <div class="zn-divide">
          <zn-progress-tile start-time="${now - 50}"
                            max-time="${now - 250}"
                            wait-time="2"
                            caption="Jane Doe"
                            avatar="https://i.pravatar.cc/40?img=30">
          </zn-progress-tile>

          <zn-progress-tile start-time="${now - 250}"
                            max-time="${now - 250}"
                            wait-time="246"
                            max-wait-time="${60 * 5}"
                            caption="Jane Doe"
                            avatar="https://i.pravatar.cc/40?img=30">
          </zn-progress-tile>

          <zn-progress-tile start-time="${now - 200}"
                            max-time="${now - 250}"
                            wait-time="2"
                            caption="Jane Doe"
                            avatar="https://i.pravatar.cc/40?img=30">
          </zn-progress-tile>

        </div>
      </zn-panel>`;
  },
  args: {
    caption: 'Ready Made Panel',
  },
};
