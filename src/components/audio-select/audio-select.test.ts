import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-audio-select>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-audio-select></zn-audio-select> `);

    expect(el).to.exist;
  });
});
