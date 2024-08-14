import {html} from "lit";
import {Meta, StoryObj} from "@storybook/web-components";

import '../../src/Popup';

const meta: Meta = {
  component: 'zn-popup',
  title: 'Elements/Popup',
  tags: ['elements', 'popup'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
    render: ({
      active,
      placement,
      strategy,
      distance,
      skidding,
      arrow,
      arrowPlacement,
      arrowPadding,
      flipFallbackStrategy,
      sync,
      flip
    }) => (html`
      <div style="height: 250px; display: flex; justify-content: center; align-items: center">
        <zn-popup caption="Popup"
                  .active="${active}"
                  .placement="${placement}"
                  .strategy="${strategy}"
                  .distance="${distance}"
                  .skidding="${skidding}"
                  .arrow="${arrow}"
                  .arrowPlacement="${arrowPlacement}"
                  .arrowPadding="${arrowPadding}"
                  .flip="${flip}"
                  .flipFallbackStrategy="${flipFallbackStrategy}"
                  .sync="${sync}">
          <div slot="anchor"
               style="inline-size: 150px; block-size: 150px; border: 1px dashed #ccc;">
          </div>
          <div class="box"
               style="min-width: 100px; height: 50px; background-color: rgb(var(--zn-primary)); border-radius: 5px;">
        </zn-popup>
      </div>
    `),
    args: {
      active: true,
      placement: 'top',
      strategy: 'fixed',
      distance: 0,
      skidding: 0,
      arrow: false,
      arrowPlacement: 'anchor',
      arrowPadding: 10,
      flipFallbackStrategy: 'best-fit',
      sync: 'auto',
      flip: true
    },
    argTypes: {
      active: {
        description: 'The visibility of the popup',
      },
      placement: {
        description: 'The placement of the popup',
        options: ['top-start', 'top', 'top-end', 'right-start', 'right', 'right-end', 'bottom-start', 'bottom', 'bottom-end', 'left-start', 'left', 'left-end'],
        control: {type: 'select'}
      },
      strategy: {
        description: 'The strategy of the popup',
        options: ['absolute', 'fixed'],
        control: {type: 'select'}
      },
      distance: {
        description: 'The distance of the popup',
        control: {type: 'number'}
      },
      skidding: {
        description: 'The skidding of the popup',
        control: {type: 'number'}
      },
      arrow: {
        description: 'The visibility of the arrow',
      },
      arrowPlacement: {
        description: 'The placement of the arrow',
        options: ['start', 'end', 'center', 'anchor'],
        control: {type: 'select'}
      },
      arrowPadding: {
        description: 'The padding of the arrow',
        control: {type: 'number'}
      },
      flipFallbackStrategy: {
        description: 'The fallback strategy of the flip',
        options: ['initial', 'best-fit'],
        control: {type: 'select'}
      },
      sync: {
        description: 'The sync of the popup',
        options: ['width', 'height', 'auto'],
        control: {type: 'select'}
      }
    },
  }
;
