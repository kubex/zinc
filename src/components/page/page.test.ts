import '../../../dist/zn.min.js';
import {aTimeout, expect, fixture, html} from '@open-wc/testing';
import type ZnPage from './page.component';

describe('<zn-page>', () => {
  it('renders header actions and generated tabs', async () => {
    const el = await fixture<ZnPage>(html`
      <zn-page caption="Page Title" summary="Page Summary">
        <zn-button slot="actions" type="primary" size="small" href="/ui">UI Examples</zn-button>

        <zn-tab caption="Overview">Overview Content</zn-tab>
        <zn-tab caption="Tab One">Tab One Content</zn-tab>
        <zn-tab caption="Tab Two" id="tab-2">Tab Two Content</zn-tab>
        <zn-tab caption="Dynamic Tab" uri="/tab-three"></zn-tab>
      </zn-page>
    `);
    await aTimeout(20);

    const header = el.shadowRoot!.querySelector('[part="header"]')!;
    const caption = el.shadowRoot!.querySelector('[part="header-caption"]')!;
    const description = el.shadowRoot!.querySelector('[part="header-description"]')!;
    const headerRight = el.shadowRoot!.querySelector('[part="header-right"]')!;
    const navbar = el.shadowRoot!.querySelector('zn-navbar')!;
    const navItems = navbar.shadowRoot!.querySelectorAll('li:not(.more)');
    const actionsSlot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="actions"]')!;
    const overviewTab = el.querySelector('zn-tab[caption="Overview"]')!;
    const overviewSlot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="page-tab-0"]')!;

    expect(header).to.exist;
    expect(headerRight).to.exist;
    expect(caption.textContent?.trim()).to.equal('Page Title');
    expect(description.textContent?.trim()).to.equal('Page Summary');
    expect(actionsSlot.assignedElements()[0].tagName).to.equal('ZN-BUTTON');
    expect(overviewTab.parentElement).to.equal(el);
    expect(overviewSlot.assignedElements()[0]).to.equal(overviewTab);
    expect(navbar.hasAttribute('hide-one')).to.equal(true);
    expect(navItems[0].getAttribute('tab')).to.equal('');
    expect(navItems[1].getAttribute('tab')).to.equal('tab-one');
    expect(navItems[2].getAttribute('tab')).to.equal('tab-2');
    expect(navItems[3].getAttribute('tab-uri')).to.equal('/tab-three');
  });

  it('pushes nested expanding actions into the generated navbar', async () => {
    const el = await fixture<ZnPage>(html`
      <zn-page caption="Page Title">
        <zn-tab caption="Overview">
          <div>
            <zn-expanding-action icon="notifications" method="drop">
              <p>Notification content</p>
            </zn-expanding-action>
          </div>
        </zn-tab>
      </zn-page>
    `);
    await aTimeout(40);

    const navbar = el.shadowRoot!.querySelector('zn-navbar')!;
    const expandingAction = navbar.shadowRoot!.querySelector('zn-expanding-action')!;

    expect(navbar).to.exist;
    expect(expandingAction).to.exist;
    expect(getComputedStyle(navbar).display).to.not.equal('none');
  });

  it('selects page tab panels when navigation items are clicked', async () => {
    const el = await fixture<ZnPage>(html`
      <zn-page caption="Page Title">
        <zn-tab caption="Overview">Overview Content</zn-tab>
        <zn-tab caption="Details">Details Content</zn-tab>
      </zn-page>
    `);
    await aTimeout(40);

    const navbar = el.shadowRoot!.querySelector('zn-navbar')!;
    const navItems = Array.from(navbar.shadowRoot!.querySelectorAll<HTMLElement>('li:not(.more)'));

    navItems[1].click();
    await aTimeout(40);

    const selectedPanel = el.shadowRoot!.querySelector<HTMLElement>('#content > div[selected]')!;
    const selectedSlot = selectedPanel.querySelector<HTMLSlotElement>('slot')!;
    const selectedTab = selectedSlot.assignedElements()[0] as HTMLElement;
    expect(selectedPanel.id).to.equal('details');
    expect(selectedTab.textContent?.trim()).to.equal('Details Content');
    expect(getComputedStyle(selectedTab).display).to.not.equal('none');
  });

  it('creates uri tab panels from page navigation items', async () => {
    const el = await fixture<ZnPage>(html`
      <zn-page caption="Page Title">
        <zn-tab caption="Overview">Overview Content</zn-tab>
        <zn-tab caption="Dynamic Tab" uri="/tab-three"></zn-tab>
      </zn-page>
    `);
    await aTimeout(40);

    const navbar = el.shadowRoot!.querySelector('zn-navbar')!;
    const dynamicItem = navbar.shadowRoot!.querySelector<HTMLElement>('li[tab-uri="/tab-three"]')!;

    dynamicItem.click();
    await aTimeout(40);

    const dynamicPanel = el.shadowRoot!.querySelector<HTMLElement>('#content > div[data-self-uri="/tab-three"]')!;
    expect(dynamicPanel).to.exist;
    expect(dynamicPanel.hasAttribute('selected')).to.equal(true);
  });

  it('loads uri tabs into the innermost page when pages are nested three layers deep', async () => {
    const el = await fixture<ZnPage>(html`
      <zn-page caption="Outer Page">
        <zn-tab caption="Outer One">
          <zn-page caption="Middle Page" nested>
            <zn-tab caption="Middle One">
              <zn-page caption="Inner Page" nested>
                <zn-tab caption="Inner Static">Inner Static Content</zn-tab>
                <zn-tab caption="Inner Dynamic" uri="/inner-dynamic"></zn-tab>
              </zn-page>
            </zn-tab>
            <zn-tab caption="Middle Two">Middle Two Content</zn-tab>
          </zn-page>
        </zn-tab>
        <zn-tab caption="Outer Two">Outer Two Content</zn-tab>
      </zn-page>
    `);
    await aTimeout(80);

    const middlePage = el.querySelector<ZnPage>('zn-page')!;
    const innerPage = middlePage.querySelector<ZnPage>('zn-page')!;
    const innerNavbar = innerPage.shadowRoot!.querySelector('zn-navbar')!;
    const innerDynamicItem = innerNavbar.shadowRoot!.querySelector<HTMLElement>('li[tab-uri="/inner-dynamic"]')!;

    innerDynamicItem.click();
    await aTimeout(60);

    const outerDynamicPanel = el.shadowRoot!.querySelector('#content > div[data-self-uri="/inner-dynamic"]');
    const middleDynamicPanel = middlePage.shadowRoot!.querySelector('#content > div[data-self-uri="/inner-dynamic"]');
    const innerDynamicPanel = innerPage.shadowRoot!.querySelector<HTMLElement>('#content > div[data-self-uri="/inner-dynamic"]')!;

    expect(outerDynamicPanel).to.equal(null);
    expect(middleDynamicPanel).to.equal(null);
    expect(innerDynamicPanel).to.exist;
    expect(innerDynamicPanel.hasAttribute('selected')).to.equal(true);
  });

  it('uses an explicit zn-tab for overview content', async () => {
    const el = await fixture<ZnPage>(html`
      <zn-page caption="Page Title">
        <zn-tab caption="Overview">Overview Content</zn-tab>
        <zn-tab caption="Details">Details Content</zn-tab>
      </zn-page>
    `);
    await aTimeout(20);

    const navbar = el.shadowRoot!.querySelector('zn-navbar')!;
    const navItems = navbar.shadowRoot!.querySelectorAll('li:not(.more)');
    const overview = el.querySelector('zn-tab')!;

    expect(navItems[0].textContent?.trim()).to.equal('Overview');
    expect(navItems[0].getAttribute('tab')).to.equal('');
    expect(overview.getAttribute('id')).to.equal('');
    expect(overview.getAttribute('slot')).to.equal('page-tab-0');
    expect(overview.textContent?.trim()).to.equal('Overview Content');
  });

  it('supports zn-header location, entity, and previous path attributes', async () => {
    const el = await fixture<ZnPage>(html`
      <zn-page
        caption="Page Title"
        full-location="/full/path"
        entity-id="entity-123"
        entity-id-show
        previous-path="/previous"
        previous-target="main">
        <zn-tab caption="Overview">Overview Content</zn-tab>
      </zn-page>
    `);
    await aTimeout(20);

    const overlay = el.shadowRoot!.querySelector<HTMLElement>('.alt-overlay')!;
    const fullLocationLink = overlay.querySelector<HTMLAnchorElement>('a')!;
    const copyButtons = overlay.querySelectorAll('zn-copy-button');
    const previousLink = el.shadowRoot!.querySelector<HTMLAnchorElement>('.caption__back')!;

    expect(overlay.classList.contains('alt-overlay--visible')).to.equal(true);
    expect(fullLocationLink.getAttribute('href')).to.equal('/full/path');
    expect(copyButtons[0].getAttribute('value')).to.equal('entity-123');
    expect(copyButtons[1].getAttribute('value')).to.equal('/full/path');
    expect(previousLink.getAttribute('href')).to.equal('/previous');
    expect(previousLink.getAttribute('data-target')).to.equal('main');
  });

  it('orders the empty tab id first and then by priority', async () => {
    const el = await fixture<ZnPage>(html`
      <zn-page caption="Page Title">
        <zn-tab caption="Later">Later Content</zn-tab>
        <zn-tab caption="Second" priority="20">Second Content</zn-tab>
        <zn-tab caption="Overview">Overview Content</zn-tab>
        <zn-tab caption="First" priority="10">First Content</zn-tab>
        <zn-tab caption="Dynamic" priority="15" uri="/dynamic"></zn-tab>
      </zn-page>
    `);
    await aTimeout(20);

    const navbar = el.shadowRoot!.querySelector('zn-navbar')!;
    const navItems = Array.from(navbar.shadowRoot!.querySelectorAll('li:not(.more)'));
    expect(navItems.map(item => item.textContent?.trim())).to.deep.equal([
      'Overview',
      'First',
      'Dynamic',
      'Second',
      'Later'
    ]);
    expect(navItems[0].getAttribute('tab')).to.equal('');
    expect(navItems[2].getAttribute('tab-uri')).to.equal('/dynamic');
    expect(el.querySelector<HTMLElement>('zn-tab[caption="Dynamic"]')!.getAttribute('id')).to.equal('dynamic');
  });

  it('preserves source order for tabs without priority', async () => {
    const el = await fixture<ZnPage>(html`
      <zn-page caption="Page Title">
        <zn-tab caption="Zoo">Zoo Content</zn-tab>
        <zn-tab caption="Accounts">Accounts Content</zn-tab>
        <zn-tab caption="Billing">Billing Content</zn-tab>
      </zn-page>
    `);
    await aTimeout(20);

    const navbar = el.shadowRoot!.querySelector('zn-navbar')!;
    const navItems = Array.from(navbar.shadowRoot!.querySelectorAll('li:not(.more)'));

    expect(navItems.map(item => item.textContent?.trim())).to.deep.equal([
      'Zoo',
      'Accounts',
      'Billing'
    ]);
    expect(el.querySelector<HTMLElement>('zn-tab[caption="Accounts"]')!.getAttribute('id')).to.equal('accounts');
  });

  it('preserves explicit empty tab ids', async () => {
    const el = await fixture<ZnPage>(html`
      <zn-page caption="Page Title">
        <zn-tab caption="Custom Overview" id="">Overview Content</zn-tab>
        <zn-tab caption="Details">Details Content</zn-tab>
      </zn-page>
    `);
    await aTimeout(20);

    const navbar = el.shadowRoot!.querySelector('zn-navbar')!;
    const navItems = navbar.shadowRoot!.querySelectorAll('li:not(.more)');

    expect(navItems[0].textContent?.trim()).to.equal('Custom Overview');
    expect(navItems[0].getAttribute('tab')).to.equal('');
  });

  it('shows a header border when scrolled without visible navigation', async () => {
    const el = await fixture<ZnPage>(html`
      <zn-page caption="Page Title" style="height: 120px;">
        <zn-tab caption="Overview">
          <div style="height: 400px;">Overview Content</div>
        </zn-tab>
      </zn-page>
    `);
    await aTimeout(20);

    const page = el.shadowRoot!.querySelector<HTMLElement>('.page')!;
    const header = el.shadowRoot!.querySelector<HTMLElement>('.page__header')!;

    expect(header.classList.contains('page__header--scrolled-no-navigation')).to.equal(false);

    page.scrollTop = 10;
    page.dispatchEvent(new Event('scroll'));
    await el.updateComplete;

    expect(header.classList.contains('page__header--scrolled-no-navigation')).to.equal(false);

    page.scrollTop = 25;
    page.dispatchEvent(new Event('scroll'));
    await el.updateComplete;

    expect(header.classList.contains('page__header--scrolled-no-navigation')).to.equal(true);

    page.scrollTop = 0;
    page.dispatchEvent(new Event('scroll'));
    await el.updateComplete;

    expect(header.classList.contains('page__header--scrolled-no-navigation')).to.equal(false);
  });

  it('does not show a header border when navigation is visible', async () => {
    const el = await fixture<ZnPage>(html`
      <zn-page caption="Page Title" style="height: 120px;">
        <zn-tab caption="Overview">
          <div style="height: 400px;">Overview Content</div>
        </zn-tab>
        <zn-tab caption="Details">Details Content</zn-tab>
      </zn-page>
    `);
    await aTimeout(20);

    const page = el.shadowRoot!.querySelector<HTMLElement>('.page')!;
    const header = el.shadowRoot!.querySelector<HTMLElement>('.page__header')!;

    page.scrollTop = 25;
    page.dispatchEvent(new Event('scroll'));
    await el.updateComplete;

    expect(header.classList.contains('page__header--scrolled-no-navigation')).to.equal(false);
  });

  it('reflects nested and modal modes', async () => {
    const el = await fixture<ZnPage>(html`
      <zn-page caption="Page Title" nested modal>
        <zn-tab caption="Overview">Overview Content</zn-tab>
      </zn-page>
    `);
    await aTimeout(20);

    expect(el.hasAttribute('nested')).to.equal(true);
    expect(el.hasAttribute('modal')).to.equal(true);
  });

  it('uses the page background for the sticky header surface', async () => {
    const el = await fixture<ZnPage>(html`
      <div style="--zn-body: 12, 34, 56; --zn-panel: 1, 2, 3;">
        <zn-page caption="Page Title" modal>
          <zn-tab caption="Overview">Overview Content</zn-tab>
        </zn-page>
      </div>
    `);
    await aTimeout(20);

    const page = el.querySelector<ZnPage>('zn-page')!;
    const scroller = page.shadowRoot!.querySelector<HTMLElement>('.page')!;
    const header = page.shadowRoot!.querySelector<HTMLElement>('.page__header')!;

    expect(getComputedStyle(scroller).backgroundColor).to.equal('rgb(12, 34, 56)');
    expect(getComputedStyle(header).backgroundColor).to.equal('rgba(12, 34, 56, 0.95)');
  });

  it('uses the panel background when placed inside a panel', async () => {
    const el = await fixture<HTMLElement>(html`
      <div style="--zn-body: 12, 34, 56; --zn-panel: 1, 2, 3;">
        <zn-panel flush>
          <zn-page caption="Page Title" modal>
            <zn-tab caption="Overview">Overview Content</zn-tab>
          </zn-page>
        </zn-panel>
      </div>
    `);
    await aTimeout(20);

    const page = el.querySelector<ZnPage>('zn-page')!;
    const scroller = page.shadowRoot!.querySelector<HTMLElement>('.page')!;
    const header = page.shadowRoot!.querySelector<HTMLElement>('.page__header')!;

    expect(getComputedStyle(scroller).backgroundColor).to.equal('rgb(1, 2, 3)');
    expect(getComputedStyle(header).backgroundColor).to.equal('rgba(1, 2, 3, 0.95)');
  });

  it('uses the page surface background for active navigation items', async () => {
    const el = await fixture<HTMLElement>(html`
      <div style="--zn-body: 12, 34, 56; --zn-panel: 1, 2, 3;">
        <zn-panel flush>
          <zn-page caption="Page Title">
            <zn-tab caption="Overview">Overview Content</zn-tab>
            <zn-tab caption="Details">Details Content</zn-tab>
          </zn-page>
        </zn-panel>
      </div>
    `);
    await aTimeout(40);

    const page = el.querySelector<ZnPage>('zn-page')!;
    const navbar = page.shadowRoot!.querySelector('zn-navbar')!;
    const activeNavItem = navbar.shadowRoot!.querySelector<HTMLElement>('li.zn-tb-active')!;

    await aTimeout(120);

    expect(getComputedStyle(activeNavItem).backgroundColor).to.equal('rgb(1, 2, 3)');
    expect(getComputedStyle(activeNavItem).transitionDuration).to.equal('0.1s');
  });

  it('disables breadcrumbs in modal mode', async () => {
    const el = await fixture<ZnPage>(html`
      <zn-page caption="Page Title" modal>
        <a slot="breadcrumb" href="/parent">Parent</a>
        <zn-tab caption="Overview">Overview Content</zn-tab>
      </zn-page>
    `);
    await aTimeout(20);

    const header = el.shadowRoot!.querySelector<HTMLElement>('.header')!;

    expect(header.classList.contains('header--has-breadcrumb')).to.equal(false);
    expect(el.shadowRoot!.querySelector('slot[name="breadcrumb"]')).to.equal(null);
  });
});
