import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

const base = (el: HTMLElement) => el.shadowRoot!.querySelector<HTMLElement>('[part="base"]')!;

describe('<zn-badge>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-badge></zn-badge> `);

    expect(el).to.exist;
  });

  it('applies the type, size, solid and dot classes', async () => {
    const el = await fixture<HTMLElement>(html`<zn-badge type="success" size="large" solid dot>Large</zn-badge>`);

    expect([...base(el).classList]).to.include.members(
      ['badge--success', 'badge--large', 'badge--solid', 'badge--dot']);
  });

  it('shows the sparkle icon only on ai badges', async () => {
    const ai = await fixture<HTMLElement>(html`<zn-badge type="ai">AI suggested</zn-badge>`);
    const info = await fixture<HTMLElement>(html`<zn-badge type="info">Trial</zn-badge>`);

    expect(ai.shadowRoot!.querySelector('zn-icon')).to.exist;
    expect(info.shadowRoot!.querySelector('zn-icon')).to.not.exist;
  });

  it('fills a solid badge with its type colour', async () => {
    const el = await fixture<HTMLElement>(html`
      <zn-badge type="danger" solid style="--zn-color-danger-solid: rgb(217, 46, 75)">Urgent</zn-badge>`);

    expect(getComputedStyle(base(el)).backgroundColor).to.equal('rgb(217, 46, 75)');
  });
});
