import '../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';

describe('<zn-opt-group>', () => {
  it('should render a component', async () => {
    const el = await fixture(html`
      <zn-opt-group></zn-opt-group> `);

    expect(el).to.exist;
  });

  it('should display a label', async () => {
    const el = await fixture(html`
      <zn-opt-group label="Group Label"></zn-opt-group> `);
    const label = el.shadowRoot!.querySelector('.opt-group__label');

    expect(label).to.exist;
    expect(label!.textContent!.trim()).to.equal('Group Label');
  });

  it('should have role="group"', async () => {
    const el = await fixture(html`
      <zn-opt-group label="Test"></zn-opt-group> `);

    expect(el.getAttribute('role')).to.equal('group');
  });
});
