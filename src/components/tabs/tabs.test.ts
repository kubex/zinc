import '../../../dist/zn.min.js';
import { aTimeout, expect, fixture, html } from '@open-wc/testing';
import type ZnTabs from './tabs.component';

describe('<zn-tabs>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-tabs></zn-tabs> `);

    expect(el).to.exist;
  });

  it('does not register tabs belonging to a nested zn-page', async () => {
    const el = await fixture<ZnTabs>(html`
      <zn-tabs>
        <div class="outer-home">Outer Home</div>
        <div id="outer-second">
          <zn-page caption="Nested Page">
            <zn-tab caption="Overview">Overview Content</zn-tab>
            <zn-tab caption="Details">Details Content</zn-tab>
          </zn-page>
        </div>
      </zn-tabs>
    `);
    await aTimeout(60);

    el.setActiveTab('outer-second', false, false);
    await aTimeout(20);

    // A menu selection bubbling out of the page (e.g. an ellipses action menu)
    // makes the outer tabs re-register; it must not claim the page's nav items.
    const page = el.querySelector('zn-page')!;
    page.dispatchEvent(new CustomEvent('zn-menu-select', { bubbles: true, composed: true }));
    await aTimeout(250);

    const navbar = page.shadowRoot!.querySelector('zn-navbar')!;
    const navItems = Array.from(navbar.shadowRoot!.querySelectorAll<HTMLElement>('li:not(.more)'));

    navItems[1].click();
    await aTimeout(40);
    navItems[0].click();
    await aTimeout(40);

    const outerHome = el.querySelector('.outer-home')!;
    const outerSecond = el.querySelector('#outer-second')!;
    expect(outerSecond.hasAttribute('selected')).to.equal(true);
    expect(outerHome.hasAttribute('selected')).to.equal(false);

    const selectedPagePanel = page.shadowRoot!.querySelector<HTMLElement>('#content > div[selected]')!;
    expect(selectedPagePanel.id).to.equal('');
  });
});
