import {html} from "lit";
import {Meta, StoryObj} from "@storybook/web-components";

import '../../src/Button';
import '../../src/Panel';
import '../../src/ConfirmModal';
import '../../src/FormElements/Input';

const meta: Meta = {
  component: 'zn-table',
  title: 'Components/ConfirmModal',
  tags: ['components', 'confirm-modal'],
};


export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <zn-panel caption="Data Table">
      <zn-confirm trigger="trigger-modal"
                  type="error"
                  caption="This is a Triggered Modal"
                  content="This is the content of the modal, it can also include more slotted content below">
        <form>
          <zn-input for="name" label="Awesome Label">
            <input type="text" id="name" name="name"/>
          </zn-input>
        </form>
      </zn-confirm>

      <zn-button id="trigger-modal">Trigger Modal</zn-button>

      <zn-confirm trigger="trigger-no-input-modal"
                  type="error"
                  caption="This is a Triggered Modal"
                  content="This is the content of the modal, it can also include more slotted content below">
        <form>
        </form>
      </zn-confirm>

      <zn-button id="trigger-no-input-modal" style="margin-top: 10px;">Trigger No Input Modal</zn-button>
    </zn-panel>`,
  args: {},
};
