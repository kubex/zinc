import '../../../dist/zn.min.js';
import {expect, fixture, html, waitUntil} from '@open-wc/testing';

// The container's ResizeObserver can emit a benign "loop completed with undelivered
// notifications" warning when the panel resizes during layout-measuring tests. It's
// not a real error — ignore it so the test runner doesn't treat it as an uncaught
// exception (capture phase runs before the runner's).
window.addEventListener('error', (e: ErrorEvent) => {
  if (typeof e.message === 'string' && e.message.includes('ResizeObserver loop')) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
}, true);

describe('<zn-preview-frame>', () => {
  it('renders an iframe pointing at src', async () => {
    const el = await fixture(html`
      <zn-preview-frame
        src="https://site.example/embed/preview?t=x"
        frame-origin="https://site.example"
        data-uri="/payload"></zn-preview-frame>`);

    const iframe = el.shadowRoot!.querySelector('iframe');
    expect(iframe).to.exist;
    expect(iframe!.getAttribute('src')).to.equal('https://site.example/embed/preview?t=x');
  });

  const FIXTURE = html`
    <zn-preview-frame
      src="about:blank"
      frame-origin="https://site.example"
      data-uri="/payload"></zn-preview-frame>`;

  const PAYLOAD = {pageType: 'payment.subscribe', page: {Name: 'Page'}, config: {BaseProduct: 'prod'}};

  let fetchCalls: {uri: string; init?: RequestInit}[];
  const realFetch = window.fetch;

  beforeEach(() => {
    fetchCalls = [];
    window.fetch = (uri: RequestInfo | URL, init?: RequestInit) => {
      fetchCalls.push({uri: String(uri), init});
      return Promise.resolve(new Response(JSON.stringify(PAYLOAD), {
        status: 200,
        headers: {'Content-Type': 'application/json'}
      }));
    };
  });

  afterEach(() => {
    window.fetch = realFetch;
  });

  function ready(el: Element, origin = 'https://site.example') {
    const iframe = el.shadowRoot!.querySelector('iframe')!;
    window.dispatchEvent(new MessageEvent('message', {
      data: {type: 'hp-preview:ready'},
      origin,
      source: iframe.contentWindow
    }));
    return iframe;
  }

  it('answers hp-preview:ready by fetching the payload and posting hp-preview:config', async () => {
    const el = await fixture(FIXTURE);
    const iframe = el.shadowRoot!.querySelector('iframe')!;
    const posted: {msg: Record<string, unknown>; origin: string}[] = [];
    (iframe.contentWindow as {postMessage: (msg: Record<string, unknown>, origin: string) => void}).postMessage =
      (msg: Record<string, unknown>, origin: string) => posted.push({msg, origin});

    ready(el);

    await waitUntil(() => posted.length === 1);
    expect(fetchCalls[0].uri).to.equal('/payload');
    expect((fetchCalls[0].init?.headers as Record<string, string>)['x-kx-fetch-style']).to.equal('download');
    expect(posted[0].origin).to.equal('https://site.example');
    expect(posted[0].msg['type']).to.equal('hp-preview:config');
    expect(posted[0].msg['pageType']).to.equal('payment.subscribe');
    expect(posted[0].msg['config']).to.deep.equal({BaseProduct: 'prod'});
  });

  it('refresh() re-fetches the payload and posts a fresh config', async () => {
    const el = await fixture(FIXTURE);
    const iframe = el.shadowRoot!.querySelector('iframe')!;
    const posted: Record<string, unknown>[] = [];
    (iframe.contentWindow as {postMessage: (msg: Record<string, unknown>) => void}).postMessage = (msg: Record<string, unknown>) => posted.push(msg);

    await (el as HTMLElement & {refresh: () => Promise<void>}).refresh();

    expect(fetchCalls[0].uri).to.equal('/payload');
    expect(posted[0]['type']).to.equal('hp-preview:config');
  });

  it('ignores messages from other origins', async () => {
    const el = await fixture(FIXTURE);
    ready(el, 'https://evil.example');

    await new Promise(resolve => setTimeout(resolve, 50));
    expect(fetchCalls.length).to.equal(0);
  });

  it('rejects all messages when frame-origin is unset', async () => {
    const el = await fixture(html`
      <zn-preview-frame src="about:blank" data-uri="/payload"></zn-preview-frame>`);
    ready(el, 'https://site.example');

    await new Promise(resolve => setTimeout(resolve, 50));
    expect(fetchCalls.length).to.equal(0);
  });

  it('auto-saves a watched form on change, then refreshes the preview', async () => {
    const wrapper = await fixture(html`
      <div>
        <form action="/save" method="post" data-auto-save>
          <input name="caption" value="hello">
        </form>
        <zn-preview-frame
          src="about:blank"
          frame-origin="https://site.example"
          data-uri="/payload"
          debounce="10"></zn-preview-frame>
      </div>`);

    const el = wrapper.querySelector('zn-preview-frame')!;
    const iframe = el.shadowRoot!.querySelector('iframe')!;
    const posted: Record<string, unknown>[] = [];
    (iframe.contentWindow as {postMessage: (msg: Record<string, unknown>) => void}).postMessage = (msg: Record<string, unknown>) => posted.push(msg);

    const form = wrapper.querySelector('form')!;
    form.querySelector('input')!.dispatchEvent(
      new Event('change', {bubbles: true}));

    await waitUntil(() => fetchCalls.length === 2);
    expect(fetchCalls[0].uri).to.contain('/save');
    expect(fetchCalls[0].init?.method).to.equal('POST');
    expect(fetchCalls[0].init?.body).to.be.instanceOf(FormData);
    expect((fetchCalls[0].init!.body as FormData).get('caption')).to.equal('hello');
    expect(fetchCalls[1].uri).to.equal('/payload');
    await waitUntil(() => posted.length === 1);
    expect(posted[0]['type']).to.equal('hp-preview:config');
  });

  it('intercepts watched form submits so they never bubble to the shell', async () => {
    const wrapper = await fixture(html`
      <div>
        <form action="/save" method="post" data-auto-save><input name="a" value="1"></form>
        <zn-preview-frame
          src="about:blank"
          frame-origin="https://site.example"
          data-uri="/payload"></zn-preview-frame>
      </div>`);

    let bubbled = false;
    wrapper.addEventListener('submit', () => { bubbled = true; });

    wrapper.querySelector('form')!.requestSubmit();

    await waitUntil(() => fetchCalls.length >= 1);
    expect(bubbled).to.equal(false);
    expect(fetchCalls[0].uri).to.contain('/save');
  });

  it('does not save a form removed from the DOM mid-debounce', async () => {
    const wrapper = await fixture(html`
      <div>
        <form action="/save" method="post" data-auto-save><input name="a" value="1"></form>
        <zn-preview-frame
          src="about:blank"
          frame-origin="https://site.example"
          data-uri="/payload"
          debounce="10"></zn-preview-frame>
      </div>`);

    const form = wrapper.querySelector('form')!;
    form.querySelector('input')!.dispatchEvent(new Event('change', {bubbles: true}));
    form.remove();

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(fetchCalls.length).to.equal(0);
  });

  it('leaves forms without data-auto-save alone', async () => {
    const wrapper = await fixture(html`
      <div>
        <form action="/save" method="post"><input name="a" value="1"></form>
        <zn-preview-frame
          src="about:blank"
          frame-origin="https://site.example"
          data-uri="/payload"
          debounce="10"></zn-preview-frame>
      </div>`);

    let bubbled = false;
    wrapper.addEventListener('submit', e => { bubbled = true; e.preventDefault(); });

    const form = wrapper.querySelector('form')!;
    form.querySelector('input')!.dispatchEvent(new Event('change', {bubbles: true}));
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(fetchCalls.length).to.equal(0);

    form.requestSubmit();
    expect(bubbled).to.equal(true);
  });

  it('shows hp-preview:error messages in the overlay and clears on rendered', async () => {
    const el = await fixture(FIXTURE);
    const iframe = el.shadowRoot!.querySelector('iframe')!;
    let znError: CustomEvent<{message?: string}> | null = null;
    el.addEventListener('zn-error', (e: Event) => { znError = e as CustomEvent<{message?: string}>; });

    window.dispatchEvent(new MessageEvent('message', {
      data: {type: 'hp-preview:error', message: 'bad config'},
      origin: 'https://site.example',
      source: iframe.contentWindow
    }));

    await waitUntil(() => el.shadowRoot!.querySelector('[part="error"]'));
    expect(el.shadowRoot!.querySelector('[part="error"]')!.textContent).to.contain('bad config');
    expect(znError).to.exist;
    expect(znError!.detail.message).to.equal('bad config');

    window.dispatchEvent(new MessageEvent('message', {
      data: {type: 'hp-preview:rendered'},
      origin: 'https://site.example',
      source: iframe.contentWindow
    }));

    await waitUntil(() => !el.shadowRoot!.querySelector('[part="error"]'));
  });

  it('shows a payload fetch failure in the overlay', async () => {
    window.fetch = () => Promise.resolve(new Response('payload exploded', {status: 500}));
    const el = await fixture(FIXTURE);
    ready(el);

    await waitUntil(() => el.shadowRoot!.querySelector('[part="error"]'));
    expect(el.shadowRoot!.querySelector('[part="error"]')!.textContent).to.contain('payload exploded');
  });

  it('scales the iframe down to fit a narrow container', async () => {
    const wrapper = await fixture(html`
      <div style="width: 640px;">
        <zn-preview-frame
          src="about:blank"
          frame-origin="https://site.example"
          data-uri="/payload"
          view-width="1280"></zn-preview-frame>
      </div>`);

    const el = wrapper.querySelector('zn-preview-frame')!;
    const iframe = el.shadowRoot!.querySelector('iframe')!;
    await waitUntil(() => iframe.style.transform.includes('scale(0.5)'));
    expect(iframe.style.width).to.equal('1280px');
    // Heights derive from view-height (default 720), never from measurement:
    // iframe keeps its virtual layout height, the container shows it scaled.
    expect(iframe.style.height).to.equal('720px');
    const container = el.shadowRoot!.querySelector<HTMLDivElement>('.preview')!;
    await waitUntil(() => container.style.height === '360px');
  });

  it('scales up to fill a wider container, keeping the aspect ratio', async () => {
    const wrapper = await fixture(html`
      <div style="width: 800px;">
        <zn-preview-frame
          src="about:blank"
          frame-origin="https://site.example"
          data-uri="/payload"
          view-width="400"
          view-height="225"></zn-preview-frame>
      </div>`);

    const el = wrapper.querySelector('zn-preview-frame')!;
    const iframe = el.shadowRoot!.querySelector('iframe')!;
    await waitUntil(() => iframe.style.transform.includes('scale(2)'));
    expect(iframe.style.width).to.equal('400px');
    const container = el.shadowRoot!.querySelector<HTMLDivElement>('.preview')!;
    // 225 * 2 — the visible box stays 16:9 (800 × 450).
    await waitUntil(() => container.style.height === '450px');
  });
});
