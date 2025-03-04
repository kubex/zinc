import '../../../dist/zinc.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-datepicker>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-datepicker></zn-datepicker> `);

    expect(el).to.exist;
  });
});
