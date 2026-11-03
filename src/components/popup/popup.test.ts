import '../../../dist/zn.min.js';
import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import type ZnPopup from './popup.component';

describe('<zn-popup>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-popup></zn-popup> `);

    expect(el).to.exist;
  });

  it('keeps following a new anchor set while open', async () => {
    const wrapper = await fixture(html`
      <div>
        <button id="first">First</button>
        <button id="second">Second</button>
        <zn-popup anchor="first" active><div>Content</div></zn-popup>
      </div>`);
    const popup = wrapper.querySelector<ZnPopup>('zn-popup')!;
    await oneEvent(popup, 'zn-reposition');

    popup.anchor = 'second';
    await oneEvent(popup, 'zn-reposition');

    // The positioner repositions on window resize; a stopped one never would
    const repositioned = oneEvent(popup, 'zn-reposition');
    window.dispatchEvent(new Event('resize'));
    await repositioned;
  });
});
