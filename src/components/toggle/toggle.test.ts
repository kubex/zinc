import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-toggle>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-toggle></zn-toggle> `);

    expect(el).to.exist;
  });

  it('should render the description under the label', async () => {
    const el = await fixture<HTMLElement>(html`
      <zn-toggle label="Email notifications" description="Receive an email when mentioned."></zn-toggle> `);

    const label = el.shadowRoot!.querySelector('.switch-label')!;
    const description = el.shadowRoot!.querySelector('[part="description"]')!;

    expect(description.textContent).to.include('Receive an email when mentioned.');
    expect(label.nextElementSibling).to.equal(description);
  });
});
