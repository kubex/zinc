import '../../../dist/zn.min.js';
import { aTimeout, expect, fixture, html } from '@open-wc/testing';
import { shouldRestoreTabSelection } from './tabs-navigation';
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

  it('restores tabs for reload and browser history navigation', () => {
    expect(shouldRestoreTabSelection([{ type: 'reload' }])).to.equal(true);
    expect(shouldRestoreTabSelection([{ type: 'back_forward' }])).to.equal(true);
    expect(shouldRestoreTabSelection([{ type: 'navigate' }])).to.equal(false);
    expect(shouldRestoreTabSelection([])).to.equal(false);
  });

  it('discards a stored tab after navigating to the page', async () => {
    const storeKey = 'tabs-navigation-test';
    const storageKey = `zntab:${storeKey}`;
    sessionStorage.setItem(storageKey, '0,second');

    const el = await fixture<ZnTabs>(html`
      <zn-tabs store-key=${storeKey} active="first">
        <zn-navbar slot="top">
          <li tab="first">First</li>
          <li tab="second">Second</li>
        </zn-navbar>
        <div id="first">First panel</div>
        <div id="second">Second panel</div>
      </zn-tabs>
    `);

    await new Promise(resolve => setTimeout(resolve, 20));

    expect(el.getAttribute('active')).to.equal('first');
    expect(sessionStorage.getItem(storageKey)).to.equal(null);
  });
});
