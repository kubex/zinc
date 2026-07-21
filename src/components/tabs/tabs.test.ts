import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';
import { shouldRestoreTabSelection } from './tabs-navigation';
import type ZnTabs from './tabs.component';

describe('<zn-tabs>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-tabs></zn-tabs> `);

    expect(el).to.exist;
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
