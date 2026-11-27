import '../../../dist/zn.min.js';
import { expect, fixture } from '@open-wc/testing';
import type { LitElement } from 'lit';

const messageContent = async (message: string) => {
  const el = await fixture<LitElement>('<zn-chat-message sender="Sam"></zn-chat-message>');
  el.setAttribute('message', message);
  await el.updateComplete;
  return el.shadowRoot!.querySelector<HTMLDivElement>('.message__content')!;
};

describe('<zn-chat-message>', () => {
  it('should render a component', async () => {
    const el = await fixture('<zn-chat-message></zn-chat-message>');

    expect(el).to.exist;
  });

  it('should show the footer row only when content is slotted into it', async () => {
    const empty = await fixture<LitElement>('<zn-chat-message sender="Sam">Hi</zn-chat-message>');
    const filled = await fixture<LitElement>('<zn-chat-message sender="Sam">Hi<span slot="footer">👍 1</span></zn-chat-message>');
    await filled.updateComplete;

    expect(empty.shadowRoot!.querySelector('.message__footer--visible')).to.be.null;
    expect(filled.shadowRoot!.querySelector('.message__footer--visible')).to.exist;
  });

  it('should render formatting and blocks chat styles', async () => {
    const content = await messageContent('<p><strong>Hi</strong></p><pre>code</pre><blockquote>quoted</blockquote>');

    expect(content.querySelector('p strong')?.textContent).to.equal('Hi');
    expect(content.querySelector('pre')?.textContent).to.equal('code');
    expect(content.querySelector('blockquote')?.textContent).to.equal('quoted');
  });

  it('shows the editor\'s colours, dividers and checklists', async () => {
    const content = await messageContent('<p><span style="color: rgb(59, 130, 246);">blue</span> <s>old</s></p><hr>'
      + '<ul data-checklist=""><li data-checked="true">done</li></ul>');

    expect(getComputedStyle(content.querySelector('span')!).color).to.equal('rgb(59, 130, 246)');
    expect(content.querySelector('s')?.textContent).to.equal('old');
    expect(content.querySelector('hr')).to.exist;
    expect(getComputedStyle(content.querySelector('li')!, '::before').content).to.equal('"☑"');
  });

  it('keeps the editor\'s headings, and marks nested bullets as the editor does', async () => {
    const content = await messageContent('<h1>Title</h1><h2>Sub</h2><ul><li>a<ul><li>b<ul><li>c</li></ul></li></ul></li></ul>');

    expect(content.querySelector('h1')?.textContent).to.equal('Title');
    expect(content.querySelector('h2')?.textContent).to.equal('Sub');
    const markers = Array.from(content.querySelectorAll('li'), li => getComputedStyle(li, '::before').content);
    expect(markers).to.deep.equal(['"•"', '"◦"', '"▪"']);
  });

  it('shows an image the editor held inline, but never fetches one from elsewhere', async () => {
    const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const content = await messageContent(`<p>this is a goose</p><p><img src="${png}" alt="goose"></p>`
      + '<p><img src="https://tracker.test/pixel.gif"></p><p><img src="data:image/svg+xml;base64,PHN2Zz48L3N2Zz4="></p>');

    const images = content.querySelectorAll('img');
    expect(images).to.have.length(1);
    expect(images[0].getAttribute('src')).to.equal(png);
    expect(images[0].getAttribute('alt')).to.equal('goose');
  });

  it('shows remote images only from this origin or a source the app lists', async () => {
    const el = await fixture<LitElement>('<zn-chat-message sender="Sam" image-sources="https://cdn.test/bucket/"></zn-chat-message>');
    const own = `${window.location.origin}/static/goose.png`;
    el.setAttribute('message', `<p><img src="${own}"></p>`
      + '<p><img src="https://cdn.test/bucket/goose.png"></p>'
      + '<p><img src="https://cdn.test/other-bucket/x.png"></p>'
      + '<p><img src="https://cdn.test.evil.net/bucket/x.png"></p>'
      + '<p><img src="https://tracker.test/pixel.gif"></p>');
    await el.updateComplete;
    const sources = Array.from(el.shadowRoot!.querySelectorAll('.message__content img'), img => img.getAttribute('src'));
    expect(sources).to.deep.equal([own, 'https://cdn.test/bucket/goose.png']);
  });

  it('should strip scripts, handlers and links to unsafe schemes in any case', async () => {
    const content = await messageContent(
      '<a href="JAVASCRIPT:window.__xss = true">a</a><a href="data:text/html,x">b</a>'
      + '<span onclick="window.__xss = true">c</span><script>window.__xss = true</script>'
    );

    content.querySelectorAll('a').forEach(link => expect(link.hasAttribute('href')).to.be.false);
    expect(content.querySelector('[onclick], script')).to.be.null;
    expect((window as unknown as Record<string, unknown>).__xss).to.be.undefined;
  });

  it('should drop embedded content and styles with their contents', async () => {
    const content = await messageContent(
      '<iframe src="https://example.com"></iframe><object data="x"></object><embed src="x">'
      + '<style>p{color:red}</style><img src="https://tracker.example.com/pixel.gif"><form><input></form>ok'
    );

    expect(content.querySelector('iframe, object, embed, style, img, form, input')).to.be.null;
    expect(content.textContent).to.equal('ok');
  });

  it('should open links in a new tab without the opener', async () => {
    const content = await messageContent('<a href="https://example.com/help">help</a>');
    const link = content.querySelector('a')!;

    expect(link.getAttribute('href')).to.equal('https://example.com/help');
    expect(link.getAttribute('target')).to.equal('_blank');
    expect(link.getAttribute('rel')).to.equal('noopener noreferrer');
  });

  it('should turn newlines into breaks and bare URLs into links', async () => {
    const content = await messageContent('See https://example.com/a\nor www.example.com');
    const links = content.querySelectorAll('a');

    expect(content.querySelectorAll('br').length).to.equal(1);
    expect(links[0].getAttribute('href')).to.equal('https://example.com/a');
    expect(links[1].getAttribute('href')).to.equal('https://www.example.com/');
    expect(links[1].textContent).to.equal('www.example.com');
  });

  it('should show plain text as text', async () => {
    const content = await messageContent('1 &lt; 2 &amp;&amp; 3 &gt; 2');

    expect(content.textContent).to.equal('1 < 2 && 3 > 2');
  });
});
