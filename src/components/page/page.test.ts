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

    expect(header).to.exist;
    expect(caption.textContent?.trim()).to.equal('Page Title');
    expect(description.textContent?.trim()).to.equal('Page Summary');
    expect(actionsSlot.assignedElements()[0].tagName).to.equal('ZN-BUTTON');
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
    const overview = el.shadowRoot!.querySelector('zn-tab')!;

    expect(navItems[0].textContent?.trim()).to.equal('Overview');
    expect(navItems[0].getAttribute('tab')).to.equal('');
    expect(overview.getAttribute('id')).to.equal('');
    expect(overview.textContent?.trim()).to.equal('Overview Content');
  });
});
