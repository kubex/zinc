import type {Meta, StoryObj} from "@storybook/web-components";
import {html} from "lit";

import type {InlineEdit} from "../../src/InlineEdit";
import '../../src/InlineEdit';

import '../../src/Button';
import '../../src/Icon';


const meta: Meta<typeof InlineEdit> = {
  component: 'zn-inline-edit',
  title: 'Components/InlineEdit',
  tags: ['components', 'inline-edit']
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <zn-inline-edit caption="Something" value="Awesome"></zn-inline-edit>`,
  args: {},
  argTypes: {}
};

export const Horizontal: Story = {
  render: () => html`
    <zn-inline-edit caption="Something" value="Awesome" horizontal></zn-inline-edit>`,
  args: {},
  argTypes: {}
};
