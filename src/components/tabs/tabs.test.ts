import '../../../dist/zn.min.js';
import { aTimeout, expect, fixture, html } from '@open-wc/testing';
import { locationScopedKey } from './tabs-navigation';
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

  describe('selection persistence', () => {
    const storeKey = 'tabs-navigation-test';
    const originalHref = window.location.href;
    let locationCount = 0;

    const renderTabs = () => fixture<ZnTabs>(html`
      <zn-tabs store-key=${storeKey} active="first">
        <zn-navbar slot="top">
          <li tab="first">First</li>
          <li tab="second">Second</li>
        </zn-navbar>
        <div id="first">First panel</div>
        <div id="second">Second panel</div>
      </zn-tabs>
    `);

    // Each test runs on its own location so a stored selection, and whether that
    // location may restore one, cannot leak between them.
    const navigateTo = (name: string) => window.history.pushState({}, '', `?tabs-test=${name}`);
    const returnWithHistory = () => window.dispatchEvent(new PopStateEvent('popstate'));

    beforeEach(() => {
      locationCount += 1;
      navigateTo(`case-${locationCount}`);
      sessionStorage.removeItem(`zntab:${storeKey}`);
    });

    afterEach(() => window.history.replaceState({}, '', originalHref));

    it('restores the tab a location was left on when returning to it', async () => {
      const el = await renderTabs();
      await aTimeout(40);
      el.querySelector('zn-navbar')!.querySelectorAll<HTMLElement>('li')[1].click();
      await aTimeout(40);
      expect(el.getAttribute('active')).to.equal('second');
      el.remove();

      returnWithHistory();
      const restored = await renderTabs();
      await aTimeout(40);

      expect(restored.getAttribute('active')).to.equal('second');
    });

    it('starts from the default tab when navigating to the location', async () => {
      const first = await renderTabs();
      await aTimeout(40);
      first.querySelector('zn-navbar')!.querySelectorAll<HTMLElement>('li')[1].click();
      await aTimeout(40);
      first.remove();

      // Leave and navigate back, rather than returning through history.
      const stored = window.location.search;
      navigateTo('elsewhere');
      window.history.pushState({}, '', stored);

      const el = await renderTabs();
      await aTimeout(40);

      expect(el.getAttribute('active')).to.equal('first');
    });

    it('stores tab changes made outside the navigation', async () => {
      const el = await renderTabs();
      await aTimeout(40);

      el.nextTab();
      await aTimeout(40);
      expect(el.getAttribute('active')).to.equal('second');
      el.remove();

      returnWithHistory();
      const restored = await renderTabs();
      await aTimeout(40);

      expect(restored.getAttribute('active')).to.equal('second');
    });

    it('steps back through each tab that was opened', async () => {
      const el = await renderTabs();
      await aTimeout(40);
      const items = el.querySelector('zn-navbar')!.querySelectorAll<HTMLElement>('li');

      items[1].click();
      await aTimeout(40);
      expect(el.getAttribute('active')).to.equal('second');

      await new Promise<void>(resolve => {
        window.addEventListener('popstate', () => resolve(), {once: true});
        window.history.back();
      });
      await aTimeout(40);

      expect(el.getAttribute('active')).to.equal('first');
    });

    it('forgets the selection once the location is navigated away from', async () => {
      const el = await renderTabs();
      await aTimeout(40);
      el.querySelector('zn-navbar')!.querySelectorAll<HTMLElement>('li')[1].click();
      await aTimeout(40);
      const stored = window.location.search;
      el.remove();

      navigateTo('departed');
      await aTimeout(40);
      expect(sessionStorage.getItem(`zntab:${storeKey}@${window.location.pathname}${stored}`)).to.equal(null);

      window.history.replaceState({}, '', stored);
      returnWithHistory();
      const returned = await renderTabs();
      await aTimeout(40);

      expect(returned.getAttribute('active')).to.equal('first');
    });

    it('keeps a session selection out of local storage', async () => {
      const el = await renderTabs();
      await aTimeout(40);
      el.querySelector('zn-navbar')!.querySelectorAll<HTMLElement>('li')[1].click();
      await aTimeout(40);

      expect(localStorage.getItem(`zntab:${storeKey}`)).to.equal(null);
      expect(sessionStorage.getItem(`zntab:${locationScopedKey(storeKey)}`)).to.contain('second');
    });
  });
});
