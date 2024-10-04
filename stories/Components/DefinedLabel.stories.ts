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
  {'name': 'label1'},
  {'name': 'label2'},
  {'name': 'label3', 'options': ["one", "two", "three"]}];

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
