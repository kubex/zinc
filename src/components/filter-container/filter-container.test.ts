import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';
import type ZnFilterContainer from './filter-container.component';

const nextFrame = () => new Promise(requestAnimationFrame);

describe('<zn-filter-container>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-filter-container></zn-filter-container> `);

    expect(el).to.exist;
  });

  it('hides non-matching items and empty panels', async () => {
    const el = await fixture<ZnFilterContainer>(html`
      <zn-filter-container>
        <zn-panel id="fruit"><div data-filter="Apple"></div><div data-filter="Banana"></div></zn-panel>
        <zn-panel id="veg"><div data-filter="Carrot"></div></zn-panel>
      </zn-filter-container>
    `);

    el.handleSearchChange({target: {value: 'app'}} as unknown as Event);
    await nextFrame();

    expect(el.querySelector<HTMLElement>('[data-filter="Apple"]')!.style.display).to.equal('');
    expect(el.querySelector<HTMLElement>('[data-filter="Banana"]')!.style.display).to.equal('none');
    expect(el.querySelector<HTMLElement>('#fruit')!.style.display).to.equal('');
    expect(el.querySelector<HTMLElement>('#veg')!.style.display).to.equal('none');

    el.handleSearchChange({target: {value: ''}} as unknown as Event);
    await nextFrame();

    expect(el.querySelector<HTMLElement>('#veg')!.style.display).to.equal('');
  });
});
