import {html} from "lit";
import {Meta, StoryObj} from "@storybook/web-components";

import '../../src/DefinedLabel';
import '../../src/Button';
import '../../src/Icon';

const meta: Meta = {
  component: 'zn-defined-label',
  title: 'Components/DefinedLabel',
  tags: ['components', 'defined-label'],
};

export default meta;
type Story = StoryObj;

const predefinedLabels = [
  'label1',
  'label2',
  'label3',
];

export const Default: Story = {
  render: () =>
  {
    return html`
      <form>
        <zn-defined-label predefined-labels="${JSON.stringify(predefinedLabels)}"></zn-defined-label>
      </form>
    `;
  },
};
