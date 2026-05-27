import '../../../dist/zn.min.js';
import {aTimeout, expect, fixture, html} from '@open-wc/testing';
import type ZnButtonMenu from './button-menu.component';

describe('<zn-button-menu>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-button-menu></zn-button-menu> `);

    expect(el).to.exist;
  });

  it('uses the slotted button label when creating collapsed menu items', async () => {
    const el = await fixture<ZnButtonMenu>(html`
      <zn-button-menu limit="0">
        <zn-button id="wrapped-label">
          <span>Wrapped Label</span>
        </zn-button>
      </zn-button-menu>
    `);

    await el.updateComplete;
    await aTimeout(20);
    el.calculateVisibleButtons();

    const menuItem = el.shadowRoot!.querySelector('zn-menu-item');

    expect(menuItem).to.exist;
    expect(menuItem!.innerText).to.equal('Wrapped Label');
  });

  it('uses the button content attribute when creating collapsed menu items', async () => {
    const el = await fixture<ZnButtonMenu>(html`
      <zn-button-menu limit="0">
        <zn-button id="content-label" content="Content Label"></zn-button>
      </zn-button-menu>
    `);

    await el.updateComplete;
    await aTimeout(20);
    el.calculateVisibleButtons();

    const menuItem = el.shadowRoot!.querySelector('zn-menu-item');

    expect(menuItem).to.exist;
    expect(menuItem!.innerText).to.equal('Content Label');
  });

  it('uses the button caption attribute when creating collapsed menu items', async () => {
    const el = await fixture<ZnButtonMenu>(html`
      <zn-button-menu limit="0">
        <zn-button id="caption-label" caption="Caption Label"></zn-button>
      </zn-button-menu>
    `);

    await el.updateComplete;
    await aTimeout(20);
    el.calculateVisibleButtons();

    const menuItem = el.shadowRoot!.querySelector('zn-menu-item');

    expect(menuItem).to.exist;
    expect(menuItem!.innerText).to.equal('Caption Label');
  });
});
