import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-diff>', () => {
  it('renders both column headings', async () => {
    const el = await fixture(html`
      <zn-diff before-caption="Version 2" after-caption="Version 3" after-description="Live"></zn-diff>`);

    const headings = el.shadowRoot!.querySelectorAll('[role="columnheader"]');
    expect(headings).to.have.length(2);
    expect(headings[0].textContent).to.contain('Version 2');
    expect(headings[1].textContent).to.contain('Version 3');
    expect(headings[1].textContent).to.contain('Live');
  });
});
