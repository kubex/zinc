import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

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
});
