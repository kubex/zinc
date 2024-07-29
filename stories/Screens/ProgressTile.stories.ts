import {html} from "lit";
import {Meta, StoryObj} from "@storybook/web-components";

import '../../src/Panel';
import '../../src/ProgressTile';
import '../../src/Chip';
import '../../src/Icon';

const meta: Meta = {
  title: 'Screens/ProgressTile',
  tags: ['screens', 'progress-tile']
};

export default meta;
type Story = StoryObj;

const highestTime = 1722270556 + 1000;

export const Default: Story = {
  render: ({caption}) =>
  {
    return html`
      <zn-panel caption="${caption}">
        <div class="zn-divide">
          <zn-progress-tile caption="John Doe" start="1722270556" max-time="${highestTime}"
                            avatar="https://i.pravatar.cc/40?img=30"></zn-progress-tile>
          <zn-progress-tile caption="John Doe" start="1722269556" max-time="${highestTime}"
                            avatar="https://i.pravatar.cc/40?img=30"></zn-progress-tile>
          <zn-progress-tile caption="John Doe" start="1722263808" max-time="${highestTime}"
                            avatar="https://i.pravatar.cc/40?img=30"></zn-progress-tile>
        </div>
      </zn-panel>`;
  },
  args: {
    caption: 'Ready Made Panel',
  },
};
