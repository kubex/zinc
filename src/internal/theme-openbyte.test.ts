import '../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

const root = document.documentElement;
// The minifier strips the spaces inside RGB triplets.
const token = (el: Element, name: string) => getComputedStyle(el).getPropertyValue(name).replace(/\s+/g, '');

function setTheme(t: string, m = 'light', density?: string) {
  root.setAttribute('t', t);
  root.setAttribute('m', m);
  if (density) root.setAttribute('data-density', density);
  else root.removeAttribute('data-density');
}

describe('openbyte theme tokens', () => {
  before(async () => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/dist/zn.min.css';
    const loaded = new Promise(resolve => link.addEventListener('load', resolve));
    document.head.append(link);
    await loaded;
  });

  afterEach(() => setTheme('light'));

  it('re-points the brand and derived tokens in light mode', () => {
    setTheme('openbyte');
    expect(token(root, '--zn-color-primary')).to.equal('8,94,253');
    expect(token(root, '--zn-primary')).to.equal('8,94,253');
    expect(token(root, '--zn-border-color')).to.equal('214,224,235');
    expect(token(root, '--zn-panel-border-radius')).to.equal('12px');
  });

  it('pins --zn-primary in dark mode over the base dark accent', () => {
    setTheme('openbyte', 'dark');
    expect(token(root, '--zn-primary')).to.equal('53,106,212');
    expect(token(root, '--zn-color-body')).to.equal('24,25,30');
  });

  it('applies comfortable density by default and compact on a nested container', async () => {
    setTheme('openbyte');
    const el = await fixture(html`<div data-density="compact"><span></span></div>`);
    expect(token(root, '--zn-input-height-medium')).to.equal('36px');
    expect(token(el.firstElementChild!, '--zn-input-height-medium')).to.equal('28px');
  });

  it('switches the whole page to compact from the root', () => {
    setTheme('openbyte', 'light', 'compact');
    expect(token(root, '--zn-input-height-medium')).to.equal('28px');
  });

  it('leaves the base theme untouched', () => {
    setTheme('light');
    expect(token(root, '--zn-color-primary')).to.equal('105,54,245');
    expect(token(root, '--zn-input-height-medium')).to.equal('36px');
    expect(token(root, '--zn-text-h1-font-family')).to.equal('');
  });
});
