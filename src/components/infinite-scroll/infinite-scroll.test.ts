import '../../../dist/zn.min.js';
import {expect, fixture, html, oneEvent, waitUntil} from '@open-wc/testing';
import type {ZnErrorEvent} from '../../events/zn-error';
import type ZnInfiniteScroll from './infinite-scroll.component';

describe('<zn-infinite-scroll>', () => {
  const originalFetch = window.fetch;
  let requested: string[];

  beforeEach(() => {
    requested = [];
    const pages: Record<string, string> = {
      '/items?page=2': '<p>two</p>',
      '/items?page=3': '<p>three</p>',
      '/items?page=4': '  ',
    };
    window.fetch = ((url: string) => {
      requested.push(url);
      return Promise.resolve(new Response(pages[url] ?? '', {status: url in pages ? 200 : 404}));
    }) as typeof fetch;
  });

  afterEach(() => {
    window.fetch = originalFetch;
  });

  it('loads pages while the end is visible and stops at an empty page', async () => {
    const el = await fixture<ZnInfiniteScroll>(html`
      <zn-infinite-scroll uri="/items?page=#page#"><p>one</p></zn-infinite-scroll>
    `);
    await oneEvent(el, 'zn-finish');

    expect([...el.querySelectorAll('p')].map(p => p.textContent)).to.deep.equal(['one', 'two', 'three']);
    expect(requested).to.deep.equal(['/items?page=2', '/items?page=3', '/items?page=4']);
    expect(el.page).to.equal(3);
    expect(el.finished).to.be.true;
  });

  it('waits for scrolling when the end is out of view', async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div style="height: 100px; overflow: auto;">
        <zn-infinite-scroll uri="/items?page=#page#"><div style="height: 1000px;"></div></zn-infinite-scroll>
      </div>
    `);
    await new Promise(r => setTimeout(r, 100));
    expect(requested).to.be.empty;

    wrapper.scrollTop = wrapper.scrollHeight;
    await waitUntil(() => requested.length > 0);
    expect(requested[0]).to.equal('/items?page=2');
  });

  it('loads before the end of a scroll container is reached', async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div style="height: 100px; overflow: auto;">
        <zn-infinite-scroll uri="/items?page=#page#"><div style="height: 1000px;"></div></zn-infinite-scroll>
      </div>
    `);
    await new Promise(r => setTimeout(r, 100));

    // 60px from the end, so the end itself is still out of view
    wrapper.scrollTop = wrapper.scrollHeight - wrapper.clientHeight - 60;
    await waitUntil(() => requested.length > 0);
    expect(requested[0]).to.equal('/items?page=2');
  });

  it('keeps scrolling inside the container while a page loads', async () => {
    let respond!: (response: Response) => void;
    window.fetch = (() => new Promise<Response>(resolve => {
      respond = resolve;
    })) as typeof fetch;

    const wrapper = await fixture<HTMLDivElement>(html`
      <div style="height: 100px; overflow: auto;">
        <zn-infinite-scroll uri="/items?page=#page#"><p>one</p></zn-infinite-scroll>
      </div>
    `);
    const el = wrapper.querySelector<ZnInfiniteScroll>('zn-infinite-scroll')!;
    await waitUntil(() => el.getAttribute('aria-busy') === 'true');
    expect(wrapper.style.overscrollBehaviorY).to.equal('contain');

    respond(new Response(''));
    await oneEvent(el, 'zn-finish');
    expect(wrapper.style.overscrollBehaviorY).to.equal('');
  });

  it('fades in each loaded item', async () => {
    const el = await fixture<ZnInfiniteScroll>(html`
      <zn-infinite-scroll uri="/items?page=#page#"><p>one</p></zn-infinite-scroll>
    `);
    await oneEvent(el, 'zn-load');

    const [first, second] = Array.from(el.querySelectorAll('p'));
    expect(first.getAnimations()).to.be.empty;
    const [from] = (second.getAnimations()[0].effect as KeyframeEffect).getKeyframes();
    expect(from.opacity).to.equal('0');
  });

  it('stops and emits zn-error on a failed request', async () => {
    const el = await fixture<ZnInfiniteScroll>(html`
      <zn-infinite-scroll uri="/missing?page=#page#"></zn-infinite-scroll>
    `);
    const event = await oneEvent(el, 'zn-error') as ZnErrorEvent;

    expect(event.detail.status).to.equal(404);
    expect(el.finished).to.be.true;
    expect(requested).to.have.length(1);
  });
});
