import '../../../dist/zinc.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-vertical-stepper>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-vertical-stepper></zn-vertical-stepper> `);

    expect(el).to.exist;
  });
});
