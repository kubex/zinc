import {expect, fixture, html} from '@open-wc/testing';
import {deepQuery} from './query';

describe('deepQuery', () => {
  it('returns null when no element matches', async () => {
    await fixture(html`<div></div>`);
    expect(deepQuery('.does-not-exist')).to.be.null;
  });

  it('finds an element in the light DOM of document', async () => {
    const el = await fixture<HTMLElement>(html`<div class="needle"></div>`);
    expect(deepQuery('.needle')).to.equal(el);
  });

  it('finds an element nested inside a shadow root', async () => {
    const host = await fixture<HTMLElement>(html`<div></div>`);
    const shadow = host.attachShadow({mode: 'open'});
    const needle = document.createElement('span');
    needle.className = 'needle';
    shadow.appendChild(needle);

    expect(deepQuery('.needle')).to.equal(needle);
  });

  it('finds an element across two nested shadow roots', async () => {
    const outer = await fixture<HTMLElement>(html`<div></div>`);
    const outerShadow = outer.attachShadow({mode: 'open'});

    const inner = document.createElement('div');
    outerShadow.appendChild(inner);
    const innerShadow = inner.attachShadow({mode: 'open'});

    const needle = document.createElement('span');
    needle.className = 'needle';
    innerShadow.appendChild(needle);

    expect(deepQuery('.needle')).to.equal(needle);
  });

  it('returns the first match in document order', async () => {
    const root = await fixture<HTMLElement>(html`
      <div>
        <span class="needle" data-which="light"></span>
      </div>
    `);
    const shadow = root.attachShadow({mode: 'open'});
    const inShadow = document.createElement('span');
    inShadow.className = 'needle';
    inShadow.setAttribute('data-which', 'shadow');
    shadow.appendChild(inShadow);

    const hit = deepQuery<HTMLElement>('.needle');
    expect(hit?.getAttribute('data-which')).to.equal('light');
  });

  it('accepts a custom root', async () => {
    const a = await fixture<HTMLElement>(html`<div><span class="needle"></span></div>`);
    const b = await fixture<HTMLElement>(html`<div></div>`);

    expect(deepQuery('.needle', a)).to.exist;
    expect(deepQuery('.needle', b)).to.be.null;
  });
});
