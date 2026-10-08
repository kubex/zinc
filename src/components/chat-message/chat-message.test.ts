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

  it('should render formatting and blocks chat styles', async () => {
    const content = await messageContent('<p><strong>Hi</strong></p><pre>code</pre><blockquote>quoted</blockquote>');

    expect(content.querySelector('p strong')?.textContent).to.equal('Hi');
    expect(content.querySelector('pre')?.textContent).to.equal('code');
    expect(content.querySelector('blockquote')?.textContent).to.equal('quoted');
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
