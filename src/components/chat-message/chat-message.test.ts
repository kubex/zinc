import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-chat-message>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-chat-message></zn-chat-message> `);

    expect(el).to.exist;
  });
});
