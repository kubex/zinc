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

  it('should render markup in the text body as text', async () => {
    const content = await textSection('&lt;img src="x" onerror="window.__xss = true"&gt; hello');

    expect(content.querySelector('img')).to.be.null;
    expect(content.textContent).to.contain('<img src="x" onerror="window.__xss = true"> hello');
    expect((window as unknown as Record<string, unknown>).__xss).to.be.undefined;
  });

  it('should treat escaped breaks in the text body as line breaks', async () => {
    const content = await textSection('line1&lt;br /&gt;line2');

    expect(content.textContent).to.not.contain('<br');
    expect(content.querySelectorAll('br').length).to.be.greaterThan(1);
  });
});
