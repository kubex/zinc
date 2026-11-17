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

  it('sizes the arrow from --zn-tooltip-arrow-size', async () => {
    const el = await fixture<ZnTooltip>(html`
      <zn-tooltip content="Hi" open style="--zn-tooltip-arrow-size: 0">
        <button>Trigger</button>
      </zn-tooltip>`);
    const arrow = el.shadowRoot!.querySelector('zn-popup')!.shadowRoot!.querySelector('[part=arrow]')!;

    expect(arrow.getBoundingClientRect().width).to.equal(0);
  });

  it('toggles on click', async () => {
    const el = await fixture<ZnTooltip>(html`
      <zn-tooltip content="Click again to dismiss" trigger="click">
        <button>Trigger</button>
      </zn-tooltip>`);
    const button = el.querySelector('button')!;

    button.click();
    await waitUntil(() => el.open);

    button.click();
    await waitUntil(() => !el.open, 'second click did not dismiss');
  });

  it('waits before opening on hover', async () => {
    const el = await fixture<ZnTooltip>(html`
      <zn-tooltip content="Columns">
        <button>Trigger</button>
      </zn-tooltip>`);
    await new Promise(resolve => setTimeout(resolve, 350)); // let any earlier tooltip's warm window lapse

    mouse(el, 'mouseover');
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(el.open).to.be.false;

    await waitUntil(() => el.open);
  });

  it('opens a neighbour instantly right after another hides', async () => {
    const el = await fixture<HTMLElement>(html`
      <div>
        <zn-tooltip content="A"><button>A</button></zn-tooltip>
        <zn-tooltip content="B"><button>B</button></zn-tooltip>
      </div>`);
    const [a, b] = [...el.querySelectorAll<ZnTooltip>('zn-tooltip')];

    mouse(a, 'mouseover');
    await waitUntil(() => a.open);

    mouse(a, 'mouseout');
    mouse(b, 'mouseover');
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(a.open).to.be.false;
    expect(b.open).to.be.true;
    expect(b.hasAttribute('data-instant')).to.be.true;
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

  it('paints the bubble from the tooltip tokens', async () => {
    const el = await fixture<ZnTooltip>(html`
      <zn-tooltip content="Hi" open
                  style="--zn-tooltip-background-color: rgb(1, 2, 3); --zn-tooltip-color: rgb(4, 5, 6)">
        <button>Trigger</button>
      </zn-tooltip>`);
    const body = el.shadowRoot!.querySelector('.tooltip__body')!;

    expect(getComputedStyle(body).backgroundColor).to.equal('rgb(1, 2, 3)');
    expect(getComputedStyle(body).color).to.equal('rgb(4, 5, 6)');
  });
});
