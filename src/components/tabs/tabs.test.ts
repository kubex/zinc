import '../../../dist/zn.min.js';
import { aTimeout, expect, fixture, html } from '@open-wc/testing';
import type ZnTabs from './tabs.component';

describe('<zn-tabs>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-tabs></zn-tabs> `);

    expect(el).to.exist;
  });

  it('selects the configured default tab when there is no stored selection', async () => {
    const el = await fixture<ZnTabs>(html`
      <zn-tabs active="second">
        <div slot="top" tab="first">First</div>
        <div slot="top" tab="second">Second</div>
        <section id="first">First panel</section>
        <section id="second">Second panel</section>
      </zn-tabs>
    `);
    await aTimeout(30);

    expect(el.getAttribute('active')).to.equal('second');
    expect(el.querySelector('#first')!.hasAttribute('selected')).to.equal(false);
    expect(el.querySelector('#second')!.hasAttribute('selected')).to.equal(true);
  });

  it('selects the configured default URI tab when there is no stored selection', async () => {
    const el = await fixture<ZnTabs>(html`
      <zn-tabs default-uri="/second">
        <div slot="top" tab-uri="/first">First</div>
        <div slot="top" tab-uri="/second">Second</div>
        <section>Second panel</section>
      </zn-tabs>
    `);
    await aTimeout(40);

    expect(el.querySelector('[tab-uri="/first"]')!.classList.contains('active')).to.equal(false);
    expect(el.querySelector('[tab-uri="/second"]')!.classList.contains('active')).to.equal(true);
    expect(el.querySelector('section')!.hasAttribute('selected')).to.equal(true);
  });

  it('selects the first tab and its panel when there is no stored or configured default', async () => {
    const el = await fixture<ZnTabs>(html`
      <zn-tabs>
        <div slot="top" tab="first">First</div>
        <div slot="top" tab="second">Second</div>
        <section id="first">First panel</section>
        <section id="second">Second panel</section>
      </zn-tabs>
    `);
    await aTimeout(30);

    expect(el.getAttribute('active')).to.equal('first');
    expect(el.querySelector('[tab="first"]')!.classList.contains('active')).to.equal(true);
    expect(el.querySelector('#first')!.hasAttribute('selected')).to.equal(true);
    expect(el.querySelector('#second')!.hasAttribute('selected')).to.equal(false);
  });
});
