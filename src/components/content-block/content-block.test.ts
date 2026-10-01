import '../../../dist/zn.min.js';
import { expect, fixture } from '@open-wc/testing';
import type { LitElement } from 'lit';

const textSection = async (body: string) => {
  const el = await fixture<LitElement>(
    `<zn-content-block><div slot="text">${body}</div></zn-content-block>`
  );
  await el.updateComplete;
  return el.shadowRoot!.querySelector<HTMLDivElement>('.text-content')!;
};

describe('<zn-content-block>', () => {
  it('should render a component', async () => {
    const el = await fixture('<zn-content-block></zn-content-block>');

    expect(el).to.exist;
  });

  it('should render plain text in the text body as text', async () => {
    const content = await textSection('1 &lt; 2 &amp;&amp; 3 &gt; 2');

    expect(content.textContent).to.contain('1 < 2 && 3 > 2');
  });

  it('should drop images and handlers from markup in the text body', async () => {
    const content = await textSection('&lt;img src="x" onerror="window.__xss = true"&gt; hello');

    expect(content.querySelector('img')).to.be.null;
    expect(content.textContent).to.contain('hello');
    expect((window as unknown as Record<string, unknown>).__xss).to.be.undefined;
  });

  it('should render allowed formatting from markup in the text body', async () => {
    const content = await textSection(
      '&lt;p&gt;&lt;em&gt;&lt;strong&gt;Need help?&lt;/strong&gt; Visit our '
      + '&lt;a href="http://help.example.com" onclick="x()"&gt;Help Center&lt;/a&gt;&lt;/em&gt;&lt;/p&gt;'
    );

    expect(content.querySelector('p em strong')?.textContent).to.equal('Need help?');
    const link = content.querySelector('a')!;
    expect(link.getAttribute('href')).to.equal('http://help.example.com/');
    expect(link.getAttribute('rel')).to.equal('noopener noreferrer');
    expect(link.hasAttribute('onclick')).to.be.false;
    expect(content.textContent).to.not.contain('<p>');
  });

  it('should strip unsafe links and dropped elements from markup in the text body', async () => {
    const content = await textSection(
      '&lt;p&gt;&lt;a href="JavaScript:alert(1)"&gt;click&lt;/a&gt;&lt;/p&gt;'
      + '&lt;style&gt;p{color:red}&lt;/style&gt;&lt;script&gt;window.__xss = true&lt;/script&gt;'
    );

    expect(content.querySelector('a')!.hasAttribute('href')).to.be.false;
    expect(content.querySelector('style, script')).to.be.null;
    expect(content.textContent).to.not.contain('color:red');
    expect((window as unknown as Record<string, unknown>).__xss).to.be.undefined;
  });

  it('should treat escaped breaks in the text body as line breaks', async () => {
    const content = await textSection('line1&lt;br /&gt;line2');

    expect(content.textContent).to.not.contain('<br');
    expect(content.querySelectorAll('br').length).to.be.greaterThan(1);
  });
});
