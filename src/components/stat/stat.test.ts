import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-stat>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-stat></zn-stat> `);

    expect(el).to.exist;
    expect(el.shadowRoot).to.exist;
  });

  it('renders a positive delta in the success text colour', async () => {
    const el = await fixture<HTMLElement>(html`
      <zn-stat amount="110" previous="100" show-delta style="--zn-color-success-fg: rgb(1, 2, 3)"></zn-stat>`);
    const positive = el.shadowRoot!.querySelector('.positive')!;

    expect(positive).to.exist;
    expect(getComputedStyle(positive).color).to.equal('rgb(1, 2, 3)');
  });

  it('renders the whole stat as a link with an arrow when given an href', async () => {
    const el = await fixture<HTMLElement>(html`
      <zn-stat layout="value-first" caption="Fails" amount="3" href="/fails" data-target="primary"></zn-stat>`);
    await (el as unknown as {updateComplete: Promise<unknown>}).updateComplete;
    const link = el.shadowRoot!.querySelector('a.stat-link')!;

    expect(link).to.exist;
    expect(link.getAttribute('href')).to.equal('/fails');
    expect(link.getAttribute('data-target')).to.equal('primary');
    expect(link.querySelector('.caption')!.textContent).to.equal('Fails');
    expect(link.querySelector('zn-icon.stat-link__icon')).to.exist;
  });

  it('renders no link without an href', async () => {
    const el = await fixture<HTMLElement>(html` <zn-stat amount="3"></zn-stat> `);

    expect(el.shadowRoot!.querySelector('a')).to.not.exist;
  });

  it('compares amounts written with separators and symbols', async () => {
    const el = await fixture<HTMLElement>(html`
      <zn-stat layout="tile" amount="$2,941" previous="$2,875" show-delta></zn-stat>`);
    await (el as unknown as {updateComplete: Promise<unknown>}).updateComplete;
    const delta = el.shadowRoot!.querySelector('.delta')!;

    expect(delta.classList.contains('delta--good')).to.be.true;
    expect(delta.textContent!.trim()).to.equal('2.3%');
  });

  it('colours a rise as bad news with invert-delta', async () => {
    const el = await fixture<HTMLElement>(html`
      <zn-stat layout="tile" amount="148" previous="140" show-delta invert-delta></zn-stat>`);
    await (el as unknown as {updateComplete: Promise<unknown>}).updateComplete;

    expect(el.shadowRoot!.querySelector('.delta')!.classList.contains('delta--bad')).to.be.true;
  });

  it('draws a sparkline from the spark values', async () => {
    const el = await fixture<HTMLElement>(html`<zn-stat layout="tile" amount="1" spark="1,3,2"></zn-stat>`);
    await (el as unknown as {updateComplete: Promise<unknown>}).updateComplete;

    expect(el.shadowRoot!.querySelectorAll('.spark path')).to.have.length(2);
  });

  it('toggles a selectable tile', async () => {
    const el = await fixture<HTMLElement & {selected: boolean; updateComplete: Promise<unknown>}>(html`
      <zn-stat layout="tile" selectable caption="Declined" amount="148"></zn-stat>`);
    await el.updateComplete;
    const button = el.shadowRoot!.querySelector('button')!;

    expect(button.getAttribute('aria-pressed')).to.equal('false');
    button.click();
    await el.updateComplete;
    expect(el.selected).to.be.true;
    expect(button.getAttribute('aria-pressed')).to.equal('true');
  });
});
