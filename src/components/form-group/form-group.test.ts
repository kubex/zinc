import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-form-group>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-form-group></zn-form-group> `);

    expect(el).to.exist;
  });

  it('should render the chip slot under the help text', async () => {
    const el = await fixture<HTMLElement>(html`
      <zn-form-group label="Settings" help-text="Configure your settings">
        <zn-chip slot="chip">New</zn-chip>
      </zn-form-group>`);

    const helpText = el.shadowRoot!.querySelector('[part="form-control-help-text"]')!;
    const chip = el.shadowRoot!.querySelector('[part="form-control-chip"]')!;

    expect(chip).to.exist;
    expect(helpText.nextElementSibling).to.equal(chip);
  });

  it('should not render the chip container without a chip slot', async () => {
    const el = await fixture<HTMLElement>(html` <zn-form-group label="Settings"></zn-form-group> `);

    expect(el.shadowRoot!.querySelector('[part="form-control-chip"]')).to.not.exist;
  });
});
