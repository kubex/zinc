import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-checkbox>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-checkbox></zn-checkbox> `);

    expect(el).to.exist;
  });

  it('renders card content and a built-in image', async () => {
    const el = await fixture(html`
      <zn-checkbox
        contained
        card-title="Payroll"
        description="Salary and pay schedule tools."
        src="payroll.svg"
        image-alt="Payroll illustration">
      </zn-checkbox>
    `);

    const image = el.shadowRoot!.querySelector('[part="image"]')!;
    expect(image.getAttribute('src')).to.equal('payroll.svg');
    expect(image.getAttribute('alt')).to.equal('Payroll illustration');
    expect(el.shadowRoot!.querySelector('[part="label"]')!.textContent).to.include('Payroll');
  });

  it('renders card-title when formatting whitespace is present in the default slot', async () => {
    const el = await fixture(html`
      <zn-checkbox contained card-title="Benefits">
        <zn-icon slot="image" src="featured_seasonal_and_gifts"></zn-icon>
      </zn-checkbox>
    `);

    expect(el.shadowRoot!.querySelector('[part="card-title"]')!.textContent).to.include('Benefits');
  });

  it('positions card images and controls', async () => {
    const el = await fixture(html`
      <zn-checkbox contained image-position="right" control-position="top-left">
        Benefits
        <zn-icon slot="image" src="featured_seasonal_and_gifts"></zn-icon>
      </zn-checkbox>
    `);
    const base = el.shadowRoot!.querySelector('[part="base"]')!;

    expect(base).to.have.class('selection-card--image-right');
    expect(base).to.have.class('selection-card--control-top-left');
    expect(el.shadowRoot!.querySelector('slot[name="image"]')).to.exist;
  });

  it('leaves a plain contained checkbox without card styles', async () => {
    const el = await fixture(html`<zn-checkbox contained description="Supporting text">Payroll</zn-checkbox>`);

    expect(el.shadowRoot!.querySelector('[part="base"]')).not.to.have.class('selection-card');
    expect(el.shadowRoot!.querySelector('[part="image-container"]')).to.be.null;
  });

  it('can hide the visual control without removing the native input', async () => {
    const el = await fixture(html`<zn-checkbox contained control-position="none">Payroll</zn-checkbox>`);

    expect(el.shadowRoot!.querySelector('input[type="checkbox"]')).to.exist;
    expect(el.shadowRoot!.querySelector('[part~="control"]')).to.exist;
    expect(el.shadowRoot!.querySelector('[part="base"]')).to.have.class('selection-card--control-none');
  });
});
