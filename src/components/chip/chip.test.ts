import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-chip>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-chip></zn-chip> `);

    expect(el).to.exist;
  });

  it('should colour a custom chip from its override', async () => {
    const el = await fixture<HTMLElement>(html`
      <zn-chip type="custom" style="--chip-color-override: rgb(15, 118, 110)">Ticket</zn-chip>`);
    const base = el.shadowRoot!.querySelector<HTMLElement>('[part="base"]')!;

    expect(getComputedStyle(base).color).to.equal('rgb(15, 118, 110)');
    expect(getComputedStyle(base).backgroundColor).to.match(/0\.1\)$/);
  });

  it('should use the text colour for a custom chip without an override', async () => {
    const el = await fixture<HTMLElement>(html`<zn-chip type="custom">Ticket</zn-chip>`);
    const neutral = await fixture<HTMLElement>(html`<zn-chip>Ticket</zn-chip>`);
    const colour = (chip: HTMLElement) => getComputedStyle(chip.shadowRoot!.querySelector('[part="base"]')!).color;

    expect(colour(el)).to.equal(colour(neutral));
  });
});
