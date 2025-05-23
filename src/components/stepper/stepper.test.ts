import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-stepper>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-stepper></zn-stepper> `);

    expect(el).to.exist;
  });
});
