import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-sp>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-sp></zn-sp> `);

    expect(el).to.exist;
  });

  it('should fill its parent container height', async () => {
    const parent = await fixture(html`
      <div style="height: 300px;">
        <zn-sp>
          <div>Content</div>
        </zn-sp>
      </div>
    `);
    const el = parent.querySelector('zn-sp')!;
    const base = el.shadowRoot!.querySelector('[part="base"]')!;

    expect(el.getBoundingClientRect().height).to.equal(300);
    expect(base.getBoundingClientRect().height).to.equal(300);
  });
});
