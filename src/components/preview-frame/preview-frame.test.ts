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

  // ShadowRoot.elementFromPoint resolves inside the shadow tree, where
  // document.elementFromPoint would only ever hand back the host.
  function hitTest(el: Element, target: Element) {
    const {left, top, width, height} = target.getBoundingClientRect();
    return el.shadowRoot!.elementFromPoint(left + width / 2, top + height / 2);
  }

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

  it('treats a 204 carrying an alert-danger header as a failed save', async () => {
    window.fetch = (uri: RequestInfo | URL, init?: RequestInit) => {
      fetchCalls.push({uri: String(uri), init});
      if (String(uri).includes('/save')) {
        return Promise.resolve(new Response(null, {
          status: 204,
          headers: {'x-kubex-alert-danger': 'Unable to update page'}
        }));
      }
      return Promise.resolve(new Response(JSON.stringify(PAYLOAD), {
        status: 200,
        headers: {'Content-Type': 'application/json'}
      }));
    };

    const wrapper = await fixture(html`
      <div>
        <form action="/save" method="post" data-auto-save><input name="a" value="1"></form>
        <zn-preview-frame
          src="about:blank"
          frame-origin="https://site.example"
          data-uri="/payload"></zn-preview-frame>
      </div>`);

    const el = wrapper.querySelector('zn-preview-frame')!;
    wrapper.querySelector('form')!.requestSubmit();

    await waitUntil(() => el.shadowRoot!.querySelector('[part="error"]'));
    expect(el.shadowRoot!.querySelector('[part="error"]')!.textContent)
      .to.contain('Unable to update page');
    // the preview must not be refreshed as though the save succeeded
    expect(fetchCalls.filter(c => c.uri === '/payload').length).to.equal(0);
    expect(fetchCalls[0].init?.headers).to.deep.equal({'x-kx-fetch-style': 'download'});
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

  it('refreshes the preview when the shell reports a form save complete', async () => {
    const wrapper = await fixture(html`
      <div>
        <form action="/save" method="post"><input name="a" value="1"></form>
        <zn-preview-frame
          src="about:blank"
          frame-origin="https://site.example"
          data-uri="/payload"></zn-preview-frame>
      </div>`);

    const el = wrapper.querySelector('zn-preview-frame')!;
    const iframe = el.shadowRoot!.querySelector('iframe')!;
    const posted: Record<string, unknown>[] = [];
    (iframe.contentWindow as {postMessage: (msg: Record<string, unknown>) => void}).postMessage = (msg: Record<string, unknown>) => posted.push(msg);

    // the shell submitted the form itself and fires 'complete' on it
    wrapper.querySelector('form')!.dispatchEvent(
      new CustomEvent('complete', {bubbles: true, detail: {}}));

    await waitUntil(() => fetchCalls.length === 1);
    expect(fetchCalls[0].uri).to.equal('/payload');
    // the save itself stays with the shell — the component must not post it
    expect(fetchCalls.some(c => c.uri.includes('/save'))).to.equal(false);
    await waitUntil(() => posted.length === 1);
    expect(posted[0]['type']).to.equal('hp-preview:config');
  });

  // A uri tab panel puts the preview in the tabs component's shadow root while
  // page-level forms (e.g. the page's Template select) stay in the document —
  // a save out there must still refresh the preview.
  it('refreshes on a shell save of a form outside the component\'s own root', async () => {
    const wrapper = await fixture(html`
      <div>
        <form action="/save" method="post"><input name="template" value="flow"></form>
        <div id="host"></div>
      </div>`);

    const shadow = wrapper.querySelector('#host')!.attachShadow({mode: 'open'});
    const el = document.createElement('zn-preview-frame');
    el.setAttribute('src', 'about:blank');
    el.setAttribute('frame-origin', 'https://site.example');
    el.setAttribute('data-uri', '/payload');
    shadow.appendChild(el);
    await (el as HTMLElement & {updateComplete: Promise<boolean>}).updateComplete;

    wrapper.querySelector('form')!.dispatchEvent(
      new CustomEvent('complete', {bubbles: true, detail: {}}));

    await waitUntil(() => fetchCalls.length === 1);
    expect(fetchCalls[0].uri).to.equal('/payload');
  });

  it('refreshes once for a composed complete event inside its own shadow root', async () => {
    const wrapper = await fixture(html`<div><div id="host"></div></div>`);

    const shadow = wrapper.querySelector('#host')!.attachShadow({mode: 'open'});
    const form = document.createElement('form');
    form.setAttribute('action', '/save');
    shadow.appendChild(form);
    const el = document.createElement('zn-preview-frame');
    el.setAttribute('src', 'about:blank');
    el.setAttribute('frame-origin', 'https://site.example');
    el.setAttribute('data-uri', '/payload');
    shadow.appendChild(el);
    await (el as HTMLElement & {updateComplete: Promise<boolean>}).updateComplete;

    // the shell fires composed events, so this reaches both the shadow root
    // and the document — it must trigger a single refresh
    form.dispatchEvent(new CustomEvent('complete', {bubbles: true, composed: true, detail: {}}));

    await waitUntil(() => fetchCalls.length === 1);
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(fetchCalls.length).to.equal(1);
  });

  it('does not intercept the submit of a refresh-on form', async () => {
    const wrapper = await fixture(html`
      <div>
        <form action="/save" method="post"><input name="a" value="1"></form>
        <zn-preview-frame
          src="about:blank"
          frame-origin="https://site.example"
          data-uri="/payload"></zn-preview-frame>
      </div>`);

    let bubbled = false;
    wrapper.addEventListener('submit', e => { bubbled = true; e.preventDefault(); });

    wrapper.querySelector('form')!.requestSubmit();

    expect(bubbled).to.equal(true);
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

  it('zooms the content out: oversized layout scaled back into the frame', async () => {
    const el = await fixture(html`
      <zn-preview-frame
        src="about:blank"
        frame-origin="https://site.example"
        data-uri="/payload"
        zoom="0.4"
        min-height="600"></zn-preview-frame>`);

    const iframe = el.shadowRoot!.querySelector('iframe')!;
    await waitUntil(() => iframe.style.transform === 'scale(0.4)');
    // 1/zoom oversize, transformed back down — the frame itself fills the
    // panel while the page renders at 40%.
    expect(iframe.style.width).to.equal('250%');
    expect(iframe.style.height).to.equal('1500px');
    const container = el.shadowRoot!.querySelector<HTMLDivElement>('.preview')!;
    expect(container.style.height).to.equal('600px');
  });

  describe('fill', () => {
    it('fills the container instead of a fixed pixel height, with no zoom transform', async () => {
      const el = await fixture(html`
        <zn-preview-frame
          src="about:blank"
          frame-origin="https://site.example"
          data-uri="/payload"
          min-height="480"
          fill></zn-preview-frame>`);

      const container = el.shadowRoot!.querySelector<HTMLDivElement>('.preview')!;
      expect(container.style.height).to.equal('100%');
      expect(container.style.minHeight).to.equal('480px');
      const iframe = el.shadowRoot!.querySelector('iframe')!;
      expect(iframe.style.width).to.equal('100%');
      expect(iframe.style.height).to.equal('100%');
      expect(iframe.style.transform).to.equal('');
    });

    it('ignores zoom when fill is set', async () => {
      const el = await fixture(html`
        <zn-preview-frame
          src="about:blank"
          frame-origin="https://site.example"
          data-uri="/payload"
          zoom="0.4"
          min-height="600"
          fill></zn-preview-frame>`);

      const iframe = el.shadowRoot!.querySelector('iframe')!;
      expect(iframe.style.transform).to.equal('');
      expect(iframe.style.width).to.equal('100%');
      expect(iframe.style.height).to.equal('100%');
      const container = el.shadowRoot!.querySelector<HTMLDivElement>('.preview')!;
      expect(container.style.height).to.equal('100%');
      expect(container.style.minHeight).to.equal('600px');
    });
  });

  it('renders at natural size by default', async () => {
    const el = await fixture(FIXTURE);
    const iframe = el.shadowRoot!.querySelector('iframe')!;
    await waitUntil(() => iframe.style.transform === 'scale(1)');
    expect(iframe.style.width).to.equal('100%');
    expect(iframe.style.height).to.equal('480px');
    const container = el.shadowRoot!.querySelector<HTMLDivElement>('.preview')!;
    expect(container.style.height).to.equal('480px');
  });

  it('defaults to a full-width desktop stage', async () => {
    const el = await fixture(FIXTURE);
    const stage = el.shadowRoot!.querySelector<HTMLDivElement>('.preview__stage')!;
    expect(stage.style.width).to.equal('100%');
  });

  it('constrains the stage to the tablet width', async () => {
    const el = await fixture(html`
      <zn-preview-frame
        src="about:blank"
        frame-origin="https://site.example"
        data-uri="/payload"
        device="tablet"></zn-preview-frame>`);

    const stage = el.shadowRoot!.querySelector<HTMLDivElement>('.preview__stage')!;
    expect(stage.style.width).to.equal('768px');
    // the iframe still sizes off the stage, so zoom maths is unaffected
    const iframe = el.shadowRoot!.querySelector('iframe')!;
    expect(iframe.style.width).to.equal('100%');
  });

  it('constrains the stage to the mobile width', async () => {
    const el = await fixture(html`
      <zn-preview-frame
        src="about:blank"
        frame-origin="https://site.example"
        data-uri="/payload"
        device="mobile"></zn-preview-frame>`);

    const stage = el.shadowRoot!.querySelector<HTMLDivElement>('.preview__stage')!;
    expect(stage.style.width).to.equal('390px');
  });

  it('setTheme() posts an hp-preview:theme message', async () => {
    const el = await fixture(FIXTURE);
    const iframe = el.shadowRoot!.querySelector('iframe')!;
    const posted: {msg: Record<string, unknown>; origin: string}[] = [];
    (iframe.contentWindow as {postMessage: (msg: Record<string, unknown>, origin: string) => void}).postMessage =
      (msg: Record<string, unknown>, origin: string) => posted.push({msg, origin});

    (el as HTMLElement & {setTheme: (t: Record<string, unknown>) => void})
      .setTheme({mode: 'dark', values: {background: '#101014'}});

    await waitUntil(() => posted.length === 1);
    expect(posted[0].origin).to.equal('https://site.example');
    expect(posted[0].msg['type']).to.equal('hp-preview:theme');
    expect(posted[0].msg['mode']).to.equal('dark');
    expect(posted[0].msg['values']).to.deep.equal({background: '#101014'});
  });

  it('replays the stored theme after a ready handshake', async () => {
    const el = await fixture(FIXTURE);
    const iframe = el.shadowRoot!.querySelector('iframe')!;
    const posted: Record<string, unknown>[] = [];
    (iframe.contentWindow as {postMessage: (msg: Record<string, unknown>) => void}).postMessage =
      (msg: Record<string, unknown>) => posted.push(msg);

    (el as HTMLElement & {setTheme: (t: Record<string, unknown>) => void})
      .setTheme({mode: 'light', values: {background: '#ffffff'}});
    await waitUntil(() => posted.length === 1);

    // a frame reload re-announces readiness; the theme must survive it
    ready(el);

    await waitUntil(() => posted.length === 3);
    expect(posted[1]['type']).to.equal('hp-preview:config');
    expect(posted[2]['type']).to.equal('hp-preview:theme');
    expect(posted[2]['values']).to.deep.equal({background: '#ffffff'});
  });

  it('setTheme() does not throw and posts nothing when frame-origin is unset', async () => {
    const el = await fixture(html`
      <zn-preview-frame src="about:blank" data-uri="/payload"></zn-preview-frame>`);
    const iframe = el.shadowRoot!.querySelector('iframe')!;
    // Forward to the real postMessage (not mocked) so an unguarded '' target
    // origin actually throws its SyntaxError, same as it would in production.
    const realPostMessage = iframe.contentWindow!.postMessage.bind(iframe.contentWindow);
    let calls = 0;
    (iframe.contentWindow as {postMessage: (...args: unknown[]) => void}).postMessage =
      (...args: unknown[]) => { calls++; return (realPostMessage as (...a: unknown[]) => void)(...args); };

    expect(() => (el as HTMLElement & {setTheme: (t: Record<string, unknown>) => void})
      .setTheme({mode: 'light', values: {}})).to.not.throw();

    await new Promise(resolve => setTimeout(resolve, 50));
    expect(calls).to.equal(0);
  });

  // The docs site's theme stylesheet (--zn-text/--zn-body/--zn-panel) isn't
  // loaded in this test shell, so an undefined var() makes the whole
  // declaration invalid - set them inline to get a real computed background.
  it('renders a dot grid backdrop by default', async () => {
    const el = await fixture(FIXTURE) as HTMLElement;
    el.style.setProperty('--zn-text', '0, 0, 0');
    el.style.setProperty('--zn-body', '255, 255, 255');

    expect(el.getAttribute('backdrop')).to.equal('dots');
    const preview = el.shadowRoot!.querySelector<HTMLDivElement>('.preview')!;
    expect(getComputedStyle(preview).backgroundImage).to.not.equal('none');
  });

  it('renders a plain panel backdrop when backdrop="panel"', async () => {
    const el = await fixture(html`
      <zn-preview-frame
        src="about:blank"
        frame-origin="https://site.example"
        data-uri="/payload"
        backdrop="panel"></zn-preview-frame>`) as HTMLElement;
    el.style.setProperty('--zn-panel', '240, 240, 240');

    expect(el.getAttribute('backdrop')).to.equal('panel');
    const preview = el.shadowRoot!.querySelector<HTMLDivElement>('.preview')!;
    expect(getComputedStyle(preview).backgroundImage).to.equal('none');
  });

  it('takes no pointer input by default, so nothing clicks through to the embed', async () => {
    const el = await fixture(FIXTURE);
    const iframe = el.shadowRoot!.querySelector('iframe')!;
    expect(getComputedStyle(iframe).pointerEvents).to.equal('none');
    // hit-testing inside the shadow root: a click over the frame lands on the
    // stage behind it, never the iframe
    expect(hitTest(el, iframe)).to.not.equal(iframe);
  });

  it('lets pointer input through when interactive is set', async () => {
    const el = await fixture(html`
      <zn-preview-frame
        src="about:blank"
        frame-origin="https://site.example"
        data-uri="/payload"
        interactive></zn-preview-frame>`);

    const iframe = el.shadowRoot!.querySelector('iframe')!;
    expect(getComputedStyle(iframe).pointerEvents).to.equal('auto');
    expect(hitTest(el, iframe)).to.equal(iframe);
  });

  describe('overflowing content', () => {
    function reportHeight(el: Element, height: unknown, type = 'hp-preview:rendered') {
      const iframe = el.shadowRoot!.querySelector('iframe')!;
      window.dispatchEvent(new MessageEvent('message', {
        data: {type, height},
        origin: 'https://site.example',
        source: iframe.contentWindow
      }));
    }

    it('scrolls the panel rather than the frame when the embed reports a taller page', async () => {
      const el = await fixture(FIXTURE);
      const iframe = el.shadowRoot!.querySelector('iframe')!;
      const panel = el.shadowRoot!.querySelector<HTMLDivElement>('.preview')!;
      const stage = el.shadowRoot!.querySelector<HTMLDivElement>('.preview__stage')!;

      reportHeight(el, 1400);
      await waitUntil(() => iframe.style.height === '1400px');

      // the frame is laid out at full content height, so it never scrolls itself
      expect(stage.style.height).to.equal('1400px');
      expect(panel.style.height).to.equal('480px');
      expect(panel.scrollHeight).to.be.greaterThan(panel.clientHeight);

      // a wheel over the frame hit-tests to the stage, whose only user-scrollable
      // ancestor is the panel — so the gesture scrolls the panel
      const hit = hitTest(el, panel);
      expect(hit).to.not.equal(iframe);
      expect(panel.contains(hit!)).to.equal(true);
      expect(getComputedStyle(stage).overflowY).to.equal('hidden');

      panel.scrollTop = 200;
      expect(panel.scrollTop).to.equal(200);
    });

    it('scrolls vertically only, so a zoomed-out frame gets no horizontal bar', async () => {
      const el = await fixture(html`
        <zn-preview-frame
          src="about:blank"
          frame-origin="https://site.example"
          data-uri="/payload"
          zoom="0.5"
          min-height="400"></zn-preview-frame>`);

      const panel = el.shadowRoot!.querySelector<HTMLDivElement>('.preview')!;
      expect(getComputedStyle(panel).overflowX).to.equal('hidden');
      expect(getComputedStyle(panel).overflowY).to.equal('auto');

      const iframe = el.shadowRoot!.querySelector('iframe')!;
      reportHeight(el, 1600);
      await waitUntil(() => iframe.style.height === '1600px');

      // the stage tracks the frame's *visible* height (1600 × 0.5), so scrolling
      // stops at the end of the page instead of at the oversized layout box
      const stage = el.shadowRoot!.querySelector<HTMLDivElement>('.preview__stage')!;
      expect(stage.style.height).to.equal('800px');
      expect(panel.scrollWidth).to.equal(panel.clientWidth);
    });

    it('accepts a later hp-preview:height message when the page grows', async () => {
      const el = await fixture(FIXTURE);
      const iframe = el.shadowRoot!.querySelector('iframe')!;

      reportHeight(el, 900);
      await waitUntil(() => iframe.style.height === '900px');

      reportHeight(el, 1300, 'hp-preview:height');
      await waitUntil(() => iframe.style.height === '1300px');
    });

    it('keeps filling the panel for a page shorter than it', async () => {
      const el = await fixture(FIXTURE);
      const iframe = el.shadowRoot!.querySelector('iframe')!;
      const panel = el.shadowRoot!.querySelector<HTMLDivElement>('.preview')!;

      reportHeight(el, 120);
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(iframe.style.height).to.equal('480px');
      expect(panel.scrollHeight).to.equal(panel.clientHeight);
    });

    it('ignores a height that is missing, zero, negative or not a number', async () => {
      const el = await fixture(FIXTURE);
      const iframe = el.shadowRoot!.querySelector('iframe')!;

      for (const height of [undefined, 0, -400, 'tall', NaN, Infinity]) {
        reportHeight(el, height);
        await new Promise(resolve => setTimeout(resolve, 20));
        expect(iframe.style.height, `height: ${String(height)}`).to.equal('480px');
      }
    });

    it('ignores the reported height while the error overlay is up', async () => {
      const el = await fixture(FIXTURE);
      const iframe = el.shadowRoot!.querySelector('iframe')!;

      reportHeight(el, 1400);
      await waitUntil(() => iframe.style.height === '1400px');

      reportHeight(el, 1400, 'hp-preview:error');
      await waitUntil(() => el.shadowRoot!.querySelector('[part="error"]'));
      expect(iframe.style.height).to.equal('480px');

      // clears again once the embed reports a good render
      reportHeight(el, 1400);
      await waitUntil(() => iframe.style.height === '1400px');
    });

    it('drops the reported height when src changes', async () => {
      const el = await fixture(FIXTURE);
      const iframe = el.shadowRoot!.querySelector('iframe')!;

      reportHeight(el, 1400);
      await waitUntil(() => iframe.style.height === '1400px');

      (el as HTMLElement & {src: string}).src = 'about:blank?next';
      await waitUntil(() => iframe.style.height === '480px');
    });

    it('measures a same-origin embed without it reporting anything', async () => {
      const src = URL.createObjectURL(new Blob([
        '<!doctype html><html><body style="margin:0"><div style="height:1200px"></div></body></html>'
      ], {type: 'text/html'}));

      const el = await fixture(html`
        <zn-preview-frame src="${src}" frame-origin="https://site.example"></zn-preview-frame>`);
      const iframe = el.shadowRoot!.querySelector('iframe')!;

      await waitUntil(() => parseInt(iframe.style.height, 10) >= 1200, 'never measured the embed');
      const panel = el.shadowRoot!.querySelector<HTMLDivElement>('.preview')!;
      expect(panel.scrollHeight).to.be.greaterThan(panel.clientHeight);
      URL.revokeObjectURL(src);
    });

    it('fills the panel when a fill frame has no known content height', async () => {
      const el = await fixture(html`
        <zn-preview-frame
          src="about:blank"
          frame-origin="https://site.example"
          data-uri="/payload"
          fill></zn-preview-frame>`);

      const iframe = el.shadowRoot!.querySelector('iframe')!;
      expect(iframe.style.height).to.equal('100%');

      reportHeight(el, 1500);
      await waitUntil(() => iframe.style.height !== '100%');
      // a floor of the panel height, so a short page still fills a stretched column
      expect(iframe.style.height).to.equal('max(1500px, 100%)');
      const stage = el.shadowRoot!.querySelector<HTMLDivElement>('.preview__stage')!;
      expect(stage.style.height).to.equal('max(1500px, 100%)');
    });

    it('leaves an interactive frame at the panel height, so the embed scrolls itself', async () => {
      const el = await fixture(html`
        <zn-preview-frame
          src="about:blank"
          frame-origin="https://site.example"
          data-uri="/payload"
          fill
          interactive></zn-preview-frame>`);

      const iframe = el.shadowRoot!.querySelector('iframe')!;
      const panel = el.shadowRoot!.querySelector<HTMLDivElement>('.preview')!;
      const stage = el.shadowRoot!.querySelector<HTMLDivElement>('.preview__stage')!;

      reportHeight(el, 1500);
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(iframe.style.height).to.equal('100%');
      expect(stage.style.height).to.equal('');
      expect(panel.scrollHeight).to.equal(panel.clientHeight);
    });

    it('inflates the frame again when interactive is turned off', async () => {
      const el = await fixture(html`
        <zn-preview-frame
          src="about:blank"
          frame-origin="https://site.example"
          data-uri="/payload"
          interactive></zn-preview-frame>`) as HTMLElement & {interactive: boolean};
      const iframe = el.shadowRoot!.querySelector('iframe')!;

      reportHeight(el, 1400);
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(iframe.style.height).to.equal('480px');

      el.interactive = false;
      await waitUntil(() => iframe.style.height === '1400px', 'kept the reported height unused');
    });
  });

  it('skips the config fetch when data-uri is empty', async () => {
    const el = await fixture(html`
      <zn-preview-frame src="about:blank" frame-origin="https://site.example"></zn-preview-frame>`);
    const iframe = el.shadowRoot!.querySelector('iframe')!;
    const posted: Record<string, unknown>[] = [];
    (iframe.contentWindow as {postMessage: (msg: Record<string, unknown>) => void}).postMessage =
      (msg: Record<string, unknown>) => posted.push(msg);

    (el as HTMLElement & {setTheme: (t: Record<string, unknown>) => void}).setTheme({mode: 'light', values: {}});
    ready(el);

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(fetchCalls.length).to.equal(0);
    expect(el.shadowRoot!.querySelector('[part="error"]')).to.not.exist;
    // theme still replays even with no config to send
    expect(posted.filter(m => m['type'] === 'hp-preview:theme').length).to.equal(2);
  });
});
