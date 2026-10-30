import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-radio>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-radio></zn-radio> `);

    expect(el).to.exist;
  });

  it('renders card content and a built-in image', async () => {
    const el = await fixture(html`
      <zn-radio
        contained
        card-title="Basic"
        description="For smaller businesses."
        src="plan.svg"
        image-alt="Basic plan">
      </zn-radio>
    `);

    const image = el.shadowRoot!.querySelector('[part="image"]')!;
    expect(image.getAttribute('src')).to.equal('plan.svg');
    expect(image.getAttribute('alt')).to.equal('Basic plan');
    expect(el.shadowRoot!.querySelector('[part="label"]')!.textContent).to.include('Basic');
  });

  it('renders card-title when formatting whitespace is present in the default slot', async () => {
    const el = await fixture(html`
      <zn-radio contained card-title="Complete">
        <zn-icon slot="image" src="potted_plant"></zn-icon>
      </zn-radio>
    `);

    expect(el.shadowRoot!.querySelector('[part="card-title"]')!.textContent).to.include('Complete');
  });

  it('positions card images and controls', async () => {
    const el = await fixture(html`
      <zn-radio contained image-position="top" control-position="bottom-right">
        Complete
        <zn-icon slot="image" src="potted_plant"></zn-icon>
      </zn-radio>
    `);
    const base = el.shadowRoot!.querySelector('[part="base"]')!;

    expect(base).to.have.class('selection-card--image-top');
    expect(base).to.have.class('selection-card--control-bottom-right');
    expect(el.shadowRoot!.querySelector('slot[name="image"]')).to.exist;
  });

  it('leaves a plain contained radio without card styles', async () => {
    const el = await fixture(html`<zn-radio contained description="Supporting text">Basic</zn-radio>`);

    expect(el.shadowRoot!.querySelector('[part="base"]')).not.to.have.class('selection-card');
    expect(el.shadowRoot!.querySelector('[part="image-container"]')).to.be.null;
  });

  it('can hide the visual control without removing the native input', async () => {
    const el = await fixture(html`<zn-radio contained control-position="none">Basic</zn-radio>`);

    expect(el.shadowRoot!.querySelector('input[type="radio"]')).to.exist;
    expect(el.shadowRoot!.querySelector('[part~="control"]')).to.exist;
    expect(el.shadowRoot!.querySelector('[part="base"]')).to.have.class('selection-card--control-none');
  });
});
