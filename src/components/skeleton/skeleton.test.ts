import '../../../dist/zn.min.js';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';

describe('<zn-skeleton>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-skeleton></zn-skeleton> `);

    expect(el).to.exist;
  });

  it('takes its radius from the theme token unless radius is set', async () => {
    const themed = await fixture<HTMLElement>(html`<zn-skeleton style="--zn-skeleton-border-radius: 7px"></zn-skeleton>`);
    const explicit = await fixture<HTMLElement>(html`<zn-skeleton radius="0" style="--zn-skeleton-border-radius: 7px"></zn-skeleton>`);
    const radius = (el: HTMLElement) => getComputedStyle(el.shadowRoot!.querySelector('.skeleton')!).borderTopLeftRadius;

    expect(radius(themed)).to.equal('7px');
    expect(radius(explicit)).to.equal('0px');
  });

  it('shares one shimmer phase with skeletons shown earlier', async () => {
    const first = await fixture<HTMLElement>(html`<zn-skeleton></zn-skeleton>`);
    await new Promise(r => setTimeout(r, 200));
    const later = await fixture<HTMLElement>(html`<zn-skeleton></zn-skeleton>`);
    const animation = (el: HTMLElement) => el.shadowRoot!.querySelector('.skeleton')!.getAnimations()[0];

    await waitUntil(() => animation(later)?.startTime === 0);
    expect(animation(first).startTime).to.equal(0);
  });
});
