import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-item>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-item></zn-item> `);

    expect(el).to.exist;
  });

  it('right aligns content when align-end is set', async () => {
    const el = await fixture(html` <zn-item align-end caption="Total">$100.00</zn-item> `);
    const content = el.shadowRoot?.querySelector<HTMLElement>('.item__content-inner');

    expect(content).to.exist;
    expect(getComputedStyle(content!).textAlign).to.equal('right');
  });

  it('renders a fact with a muted caption above its value', async () => {
    const el = await fixture<HTMLElement>(html`<zn-item fact caption="Sender">noreply@example.com</zn-item>`);
    await (el as unknown as {updateComplete: Promise<unknown>}).updateComplete;
    const base = el.shadowRoot!.querySelector('.item')!;

    expect(base.classList.contains('item--fact')).to.be.true;
    expect(getComputedStyle(base).flexDirection).to.equal('column');
    expect(getComputedStyle(el.shadowRoot!.querySelector('.item__caption')!).fontWeight).to.equal('400');
  });

  it('renders a key-value row with a muted caption beside a right-aligned value', async () => {
    const el = await fixture<HTMLElement>(html`<zn-item key-value mono caption="Charge ID">fVeWtIUlss82t3RvFxD</zn-item>`);
    await (el as unknown as {updateComplete: Promise<unknown>}).updateComplete;
    const base = el.shadowRoot!.querySelector('.item')!;
    const content = el.shadowRoot!.querySelector('.item__content-inner')!;

    expect(base.classList.contains('item--key-value')).to.be.true;
    expect(getComputedStyle(base).flexDirection).to.equal('row');
    expect(getComputedStyle(el.shadowRoot!.querySelector('.item__caption')!).fontWeight).to.equal('400');
    expect(getComputedStyle(content).textAlign).to.equal('right');
    expect(base.classList.contains('item--mono')).to.be.true;
  });
});
