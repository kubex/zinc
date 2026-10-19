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

  it('sizes plain table rows to the density row height', async () => {
    setTheme('openbyte');
    const table = await fixture(html`<table><tbody><tr><td>One</td></tr></tbody></table>`);
    const cell = table.querySelector('td')!;
    expect(cell.getBoundingClientRect().height).to.equal(44);
    expect(getComputedStyle(cell).paddingTop).to.equal('4px');
  });

  it('sets a table cell meta line below its main text in muted small type', async () => {
    setTheme('openbyte');
    const table = await fixture(html`<table><tbody><tr><td><a href="#">Name</a><span class="zn-table-meta">Meta</span></td></tr></tbody></table>`);
    const meta = getComputedStyle(table.querySelector('.zn-table-meta')!);
    expect(meta.display).to.equal('block');
    expect(meta.fontSize).to.equal('12px');
    expect(meta.color).to.equal('rgb(80, 97, 122)');
  });

  it('gives chart labels the subtle text colour', () => {
    setTheme('openbyte');
    expect(getComputedStyle(root).getPropertyValue('--zn-chart-text-color').trim().toLowerCase()).to.equal('#66768e');
  });

  it('puts a toggle\'s side label first with the switch at the far edge', () => {
    setTheme('openbyte');
    expect(token(root, '--zn-toggle-side-label-direction')).to.equal('row');
    expect(token(root, '--zn-toggle-side-label-justify')).to.equal('space-between');
  });

  it('keeps the secondary button border neutral when a host re-points the active border', async () => {
    setTheme('openbyte');
    root.style.setProperty('--zn-color-border-active', '8, 94, 253');
    try {
      const button = await fixture(html`<zn-button color="secondary">Add</zn-button>`);
      await (button as unknown as {updateComplete: Promise<unknown>}).updateComplete;
      const base = button.shadowRoot!.querySelector('.button')!;
      expect(getComputedStyle(base).borderTopColor).to.equal('rgb(186, 200, 217)');
    } finally {
      root.style.removeProperty('--zn-color-border-active');
    }
  });

  it('sizes a modal page title as a dialog heading', async () => {
    setTheme('openbyte');
    const page = await fixture<HTMLElement>(html`<zn-page modal caption="Add section"></zn-page>`);
    await (page as unknown as {updateComplete: Promise<unknown>}).updateComplete;
    const caption = page.shadowRoot!.querySelector('.header__caption')!;
    expect(getComputedStyle(caption).fontSize).to.equal('16px');
  });

  it('leaves the base theme untouched', () => {
    setTheme('light');
    expect(token(root, '--zn-color-primary')).to.equal('105,54,245');
    expect(token(root, '--zn-input-height-medium')).to.equal('36px');
    expect(token(root, '--zn-text-h1-font-family')).to.equal('');
  });
});
