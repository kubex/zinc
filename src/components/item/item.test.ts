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
});
