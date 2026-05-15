import '../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';

describe('<zn-input-group>', () => {
  it('renders combo with sleep', async () => {
    const el = await fixture(html`
      <zn-input-group>
        <zn-input></zn-input>
        <zn-button>Submit</zn-button>
      </zn-input-group>
    `);
    await new Promise(r => setTimeout(r, 100));
    expect(el).to.exist;
  });
});
