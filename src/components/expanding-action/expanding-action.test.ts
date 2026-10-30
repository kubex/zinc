import '../../../dist/zn.min.js';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';

describe('<zn-expanding-action>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-expanding-action></zn-expanding-action> `);

    expect(el).to.exist;
  });

  describe('drop panel overflow', () => {
    const openPanel = async (el: HTMLElement) => {
      const dropdown = el.shadowRoot!.querySelector('zn-dropdown') as HTMLElement & { show: () => Promise<unknown> };
      await dropdown.show();
      await waitUntil(() => el.hasAttribute('open'));
      await new Promise(resolve => requestAnimationFrame(resolve));
    };

    const tallContent = html`
      <zn-expanding-action method="drop" icon="note">
        <div style="height: 4000px">tall</div>
      </zn-expanding-action>`;

    it('should bound the panel height so it cannot run off the screen', async () => {
      const el = await fixture<HTMLElement>(tallContent);
      await openPanel(el);

      const frame = el.shadowRoot!.querySelector<HTMLElement>('.expanding-action__frame')!;
      expect(frame).to.exist;
      expect(frame.getBoundingClientRect().height).to.be.at.most(window.innerHeight);
    });

    it('should scroll overflowing content rather than clipping it', async () => {
      const el = await fixture<HTMLElement>(tallContent);
      await openPanel(el);

      const content = el.shadowRoot!.querySelector<HTMLElement>('#content')!;
      expect(getComputedStyle(content).overflowY).to.equal('auto');
      expect(content.scrollHeight).to.be.greaterThan(content.clientHeight);
    });

    it('should honour an explicit max-height', async () => {
      const el = await fixture<HTMLElement>(html`
        <zn-expanding-action method="drop" icon="note" max-height="250">
          <div style="height: 4000px">tall</div>
        </zn-expanding-action>`);
      await openPanel(el);

      const frame = el.shadowRoot!.querySelector<HTMLElement>('.expanding-action__frame')!;
      expect(Math.round(frame.getBoundingClientRect().height)).to.equal(250);
    });
  });
});
