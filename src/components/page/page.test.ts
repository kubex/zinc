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
    const navbar = el.shadowRoot!.querySelector('zn-navbar')!;
    const navItems = navbar.shadowRoot!.querySelectorAll('li:not(.more)');
    const actionsSlot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="actions"]')!;
    const overviewTab = el.querySelector('zn-tab[caption="Overview"]')!;
    const overviewSlot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="page-tab-0"]')!;

    expect(header).to.exist;
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
});
