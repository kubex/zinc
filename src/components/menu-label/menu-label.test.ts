import '../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';

describe('<zn-menu-label>', () => {
  it('keeps its actions faint until the heading is focused', async () => {
    const label = await fixture<HTMLElement>(html`
      <zn-menu-label>Departments<button slot="actions" style="transition: none">⋯</button></zn-menu-label>
    `);
    const action = label.querySelector('button')!;
    expect(getComputedStyle(action).opacity).to.equal('0.55');

    action.focus();
    expect(getComputedStyle(action).opacity).to.equal('1');
  });

  it('draws a collapsed navigation heading as a dot, its text and actions hidden', async () => {
    const label = await fixture<HTMLElement>(html`
      <zn-menu-label variant="navigation" collapsed>Departments<button slot="actions">⋯</button></zn-menu-label>
    `);
    const base = label.shadowRoot!.querySelector<HTMLElement>('[part="base"]')!;

    expect(getComputedStyle(base, '::before').width).to.equal('6px');
    expect(getComputedStyle(label.shadowRoot!.querySelector('[part="label"]')!).visibility).to.equal('hidden');
  });
});
