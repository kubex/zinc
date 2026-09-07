import '../../../dist/zn.min.js';
import {expect, fixture, html, waitUntil} from '@open-wc/testing';
import type ZnDropdown from '../dropdown/dropdown.component';
import type ZnTooltip from './tooltip.component';

const mouse = (el: Element, type: string) =>
  el.dispatchEvent(new MouseEvent(type, {bubbles: true, composed: true, cancelable: true}));

describe('<zn-tooltip>', () => {
  it('should render a component', async () => {
    const el = await fixture(html`
      <zn-tooltip></zn-tooltip>`);

    expect(el).to.exist;
  });

  it('hides on mouseout', async () => {
    const el = await fixture<ZnTooltip>(html`
      <zn-tooltip content="Columns">
        <button>Trigger</button>
      </zn-tooltip>`);

    mouse(el, 'mouseover');
    await waitUntil(() => el.open);

    mouse(el, 'mouseout');
    await waitUntil(() => !el.open);

    expect(el.open).to.be.false;
  });

  // A tooltip whose trigger opens a dropdown loses its chance to hide: the pointer
  // leaves the trigger for the menu while the dropdown is registered as open.
  it('hides on mouseout while a dropdown is open', async () => {
    const dropdown = await fixture<ZnDropdown>(html`
      <zn-dropdown>
        <zn-button slot="trigger" tooltip="Columns"></zn-button>
        <zn-menu>
          <zn-menu-item value="a">Alpha</zn-menu-item>
        </zn-menu>
      </zn-dropdown>`);

    const trigger = dropdown.querySelector('zn-button')!;
    await trigger.updateComplete;
    const tooltip = trigger.shadowRoot!.querySelector('zn-tooltip')!;

    mouse(tooltip, 'mouseover');
    await waitUntil(() => tooltip.open);

    await dropdown.show();
    mouse(tooltip, 'mouseout');
    await dropdown.hide();

    await waitUntil(() => !tooltip.open, 'tooltip stayed open after the dropdown closed');
    expect(tooltip.open).to.be.false;
  });

  it('does not show while a dropdown is open', async () => {
    const dropdown = await fixture<ZnDropdown>(html`
      <zn-dropdown>
        <zn-button slot="trigger" tooltip="Columns"></zn-button>
        <zn-menu>
          <zn-menu-item value="a">Alpha</zn-menu-item>
        </zn-menu>
      </zn-dropdown>`);

    const trigger = dropdown.querySelector('zn-button')!;
    await trigger.updateComplete;
    const tooltip = trigger.shadowRoot!.querySelector('zn-tooltip')!;

    await dropdown.show();
    mouse(tooltip, 'mouseover');
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(tooltip.open).to.be.false;
    await dropdown.hide();
  });
});
